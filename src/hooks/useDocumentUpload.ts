import { useCallback } from "react";

/** Allowed MIME types for document uploads */
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

/** Maximum file size in bytes (10MB) */
const MAX_SIZE = 10 * 1024 * 1024;

export function useDocumentUpload(
  setFile: (file: File | null) => void,
  setUploading: (uploading: boolean) => void
) {
  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert("Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)");
          return;
        }

        if (file.size > MAX_SIZE) {
          alert("File size must be less than 10MB");
          return;
        }

        setFile(file);
        console.log("Document uploaded:", file.name);
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Failed to upload document");
      } finally {
        setUploading(false);
      }
    },
    [setFile, setUploading]
  );

  const removeFile = useCallback(() => {
    setFile(null);
  }, [setFile]);

  return { handleUpload, removeFile };
}
