import { supabase } from "@/lib/supabase";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AWARD_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const validateFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    const sizeMB = maxSize / (1024 * 1024);
    return { isValid: false, error: `File size must be less than ${sizeMB}MB` };
  }
  return { isValid: true };
};

export const createFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

export const handleFileDrop = (
  e: React.DragEvent<HTMLLabelElement>,
  onFileSelect: (file: File) => void,
  maxSize: number = MAX_FILE_SIZE
) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    const validation = validateFileSize(file, maxSize);
    if (validation.isValid) {
      onFileSelect(file);
    }
  }
};

export const uploadFileToSupabase = async (
  bucketName: string,
  userId: string,
  recordId: string,
  file: File
): Promise<{ url: string; fileName: string; fileSize: number } | null> => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${recordId}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (uploadError) {
    console.error(`Error uploading file to ${bucketName}:`, uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    fileName: file.name,
    fileSize: file.size,
  };
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}; 
