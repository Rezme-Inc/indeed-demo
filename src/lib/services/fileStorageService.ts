import { supabase } from '@/lib/supabase';

export interface UploadedFile {
  id: string;
  bucket_path: string;
  file_type: 'job_desc' | 'offer_letter' | 'background_report' | 'evidence';
  step_number: number;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface FileUploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

export class FileStorageService {
  // Generate file path: hr_id/candidate_id/filename
  static generateFilePath(hrId: string, candidateId: string, fileName: string): string {
    // Sanitize filename to prevent path issues
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${hrId}/${candidateId}/${sanitizedFileName}`;
  }

  // Upload file to Supabase storage
  static async uploadFile(
    candidateId: string,
    file: File,
    fileType: 'job_desc' | 'offer_letter' | 'background_report' | 'evidence',
    stepNumber: number = 1
  ): Promise<FileUploadResult> {
    try {
      // Get current authenticated user (this must match the RLS policy)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('[FileStorage] Authentication error:', authError);
        return { success: false, error: 'User not authenticated' };
      }

      const hrId = user.id;
      
      console.log('[FileStorage] Authentication check:', {
        userId: hrId,
        userEmail: user.email,
        isAuthenticated: !!user
      });

      // Generate file path with folder structure: hr_id/candidate_id/filename
      // This MUST comply with RLS policy: auth.uid()::text = (storage.foldername(name))[1]
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop() || '';
      const uniqueFileName = `${fileType}_${timestamp}.${fileExt}`;
      const filePath = this.generateFilePath(hrId, candidateId, uniqueFileName);

      console.log('[FileStorage] Upload attempt:', {
        originalName: file.name,
        uniqueFileName,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        folderStructure: `${hrId}/${candidateId}/`,
        authUserId: hrId,
        firstFolderInPath: filePath.split('/')[0]
      });

      // Verify the first folder matches the authenticated user (RLS requirement)
      const firstFolder = filePath.split('/')[0];
      if (firstFolder !== hrId) {
        console.error('[FileStorage] RLS compliance error:', {
          expectedUserId: hrId,
          actualFirstFolder: firstFolder,
          filePath
        });
        return { success: false, error: 'File path does not comply with security policies' };
      }

      // Upload to Supabase storage with RLS-compliant path
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assessment-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[FileStorage] Upload error:', uploadError);
        console.error('[FileStorage] Upload context:', {
          message: uploadError.message,
          bucketName: 'assessment-files',
          filePath,
          fileSize: file.size,
          mimeType: file.type,
          authUserId: hrId,
          firstFolderPath: firstFolder
        });
        
        // Provide more specific error based on the upload error
        if (uploadError.message?.includes('row-level security policy')) {
          return { 
            success: false, 
            error: `Security policy violation: File path must start with your user ID (${hrId})` 
          };
        }
        
        return { success: false, error: `Upload failed: ${uploadError.message}` };
      }

      console.log('[FileStorage] Storage upload successful:', uploadData);

      // Save file metadata to database using assessment_documents_new table
      const fileRecord: Omit<UploadedFile, 'id'> = {
        bucket_path: filePath,
        file_type: fileType,
        step_number: stepNumber,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString()
      };

      const { data: dbData, error: dbError } = await supabase
        .from('assessment_documents_new')
        .insert({
          hr_id: hrId,
          candidate_id: candidateId,
          ...fileRecord
        })
        .select()
        .single();

      if (dbError) {
        console.error('[FileStorage] Database error:', dbError);
        console.error('[FileStorage] Database context:', {
          hrId,
          candidateId,
          fileRecord
        });
        
        // Clean up uploaded file if database save fails
        try {
          await supabase.storage.from('assessment-files').remove([filePath]);
          console.log('[FileStorage] Cleaned up orphaned file after database error');
        } catch (cleanupError) {
          console.error('[FileStorage] Failed to cleanup file:', cleanupError);
        }
        
        return { success: false, error: `Database error: ${dbError.message}` };
      }

      console.log('[FileStorage] File uploaded successfully with RLS compliance:', {
        fileId: dbData.id,
        filePath,
        folderStructure: `${hrId}/${candidateId}/`
      });

      return {
        success: true,
        file: {
          id: dbData.id,
          ...fileRecord
        }
      };

    } catch (error) {
      console.error('[FileStorage] Unexpected error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  // Get all files for a candidate
  static async getCandidateFiles(candidateId: string): Promise<UploadedFile[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[FileStorage] User not authenticated');
        return [];
      }

      const { data, error } = await supabase
        .from('assessment_documents_new')
        .select('*')
        .eq('hr_id', user.id)
        .eq('candidate_id', candidateId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('[FileStorage] Error fetching files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FileStorage] Unexpected error:', error);
      return [];
    }
  }

  // Get file download URL (public bucket)
  static async getFileUrl(filePath: string): Promise<string | null> {
    try {
      // Since the bucket is public, we can get the public URL directly
      const { data } = await supabase.storage
        .from('assessment-files')
        .getPublicUrl(filePath);

      return data?.publicUrl || null;
    } catch (error) {
      console.error('[FileStorage] Error getting file URL:', error);
      return null;
    }
  }

  // Download file as File object (for AI processing)
  static async downloadFile(filePath: string): Promise<File | null> {
    try {
      const { data, error } = await supabase.storage
        .from('assessment-files')
        .download(filePath);

      if (error || !data) {
        console.error('[FileStorage] Error downloading file:', error);
        return null;
      }

      // Get original filename from path
      const fileName = filePath.split('/').pop() || 'downloaded_file';
      
      return new File([data], fileName, { type: data.type });
    } catch (error) {
      console.error('[FileStorage] Error downloading file:', error);
      return null;
    }
  }

  // Delete file
  static async deleteFile(candidateId: string, fileId: string): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[FileStorage] User not authenticated');
        return false;
      }

      // Get file record first
      const { data: fileRecord, error: fetchError } = await supabase
        .from('assessment_documents_new')
        .select('bucket_path')
        .eq('id', fileId)
        .eq('hr_id', user.id)
        .eq('candidate_id', candidateId)
        .single();

      if (fetchError || !fileRecord) {
        console.error('[FileStorage] File not found:', fetchError);
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('assessment-files')
        .remove([fileRecord.bucket_path]);

      if (storageError) {
        console.error('[FileStorage] Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('assessment_documents_new')
        .delete()
        .eq('id', fileId)
        .eq('hr_id', user.id)
        .eq('candidate_id', candidateId);

      if (dbError) {
        console.error('[FileStorage] Database deletion error:', dbError);
        return false;
      }

      console.log('[FileStorage] File deleted successfully');
      return true;
    } catch (error) {
      console.error('[FileStorage] Unexpected error:', error);
      return false;
    }
  }

  // Get files by category
  static async getFilesByCategory(
    candidateId: string, 
    fileType: 'job_desc' | 'offer_letter' | 'background_report' | 'evidence'
  ): Promise<UploadedFile[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return [];
      }

      const { data, error } = await supabase
        .from('assessment_documents_new')
        .select('*')
        .eq('hr_id', user.id)
        .eq('candidate_id', candidateId)
        .eq('file_type', fileType)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('[FileStorage] Error fetching files by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[FileStorage] Unexpected error:', error);
      return [];
    }
  }

  // Get latest file by category (helper method)
  static async getLatestFileByCategory(
    candidateId: string,
    fileType: 'job_desc' | 'offer_letter' | 'background_report' | 'evidence'
  ): Promise<UploadedFile | null> {
    const files = await this.getFilesByCategory(candidateId, fileType);
    return files.length > 0 ? files[0] : null;
  }
} 
