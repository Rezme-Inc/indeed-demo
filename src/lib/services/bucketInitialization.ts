import { supabase } from '@/lib/supabase';

export class BucketInitializationService {
  private static bucketCreated = false;
  private static initializationPromise: Promise<boolean> | null = null;

  /**
   * Initialize the assessment-files bucket if it doesn't exist
   */
  static async initializeBucket(): Promise<boolean> {
    // Return cached result if already initialized
    if (this.bucketCreated) {
      return true;
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = this._createBucket();
    const result = await this.initializationPromise;
    
    if (result) {
      this.bucketCreated = true;
    }

    return result;
  }

  private static async _createBucket(): Promise<boolean> {
    try {
      console.log('[BucketInit] Checking if assessment-files bucket exists...');

      // Check if bucket already exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        console.error('[BucketInit] Error listing buckets:', listError);
        console.error('[BucketInit] List error details:', {
          message: listError.message,
          cause: listError.cause
        });
        return false;
      }

      console.log('[BucketInit] Found buckets:', buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })));

      // Check if our bucket already exists
      const bucketExists = buckets?.some(bucket => bucket.name === 'assessment-files');

      if (bucketExists) {
        console.log('[BucketInit] assessment-files bucket already exists');
        return true;
      }

      // Create the bucket if it doesn't exist
      console.log('[BucketInit] Creating assessment-files bucket...');
      
      const { data: bucket, error: createError } = await supabase.storage.createBucket('assessment-files', {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 52428800, // 50MB
      });

      if (createError) {
        console.error('[BucketInit] Error creating bucket:', createError);
        console.error('[BucketInit] Create error details:', {
          message: createError.message,
          cause: createError.cause,
          bucketName: 'assessment-files'
        });
        return false;
      }

      console.log('[BucketInit] assessment-files bucket created successfully:', bucket);
      
      // Set up storage policies for the bucket
      await this._setupStoragePolicies();
      
      return true;

    } catch (error) {
      console.error('[BucketInit] Unexpected error during bucket initialization:', error);
      return false;
    }
  }

  private static async _setupStoragePolicies(): Promise<void> {
    try {
      console.log('[BucketInit] Setting up storage policies...');

      // Note: RLS policies are typically set up through SQL migrations or Supabase dashboard
      // The policies in the migration file should handle this, but we log for debugging
      console.log('[BucketInit] Storage policies should be configured via SQL migration');

    } catch (error) {
      console.error('[BucketInit] Error setting up storage policies:', error);
      // Don't fail the whole initialization if policy setup fails
    }
  }

  /**
   * Reset the initialization state (useful for testing)
   */
  static reset(): void {
    this.bucketCreated = false;
    this.initializationPromise = null;
  }
} 
