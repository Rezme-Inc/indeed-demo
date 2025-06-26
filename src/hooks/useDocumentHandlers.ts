import { useCallback } from "react";
import { useDocumentUploads } from "@/context/useDocumentUploads";

export type DocumentType =
  | "background"
  | "jobdesc"
  | "jobposting"
  | "emails"
  | "notes"
  | "companypolicy";

export function useDocumentHandlers() {
  const { setViewingDocument, setShowDocumentViewer } = useDocumentUploads();

  const viewDocument = useCallback(
    (file: File, type: DocumentType) => {
      const title =
        type === "background"
          ? "Background Check Report"
          : type === "jobdesc"
          ? "Job Description"
          : type === "jobposting"
          ? "Job Posting"
          : type === "emails"
          ? "Emails"
          : type === "notes"
          ? "Notes"
          : "Company Policy";
      setViewingDocument({ file, type, title });
      setShowDocumentViewer(true);
    },
    [setViewingDocument, setShowDocumentViewer]
  );

  const downloadDocument = useCallback((file: File, filename: string) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const getFilePreviewUrl = useCallback(
    (file: File) => URL.createObjectURL(file),
    []
  );

  return { viewDocument, downloadDocument, getFilePreviewUrl };
}
