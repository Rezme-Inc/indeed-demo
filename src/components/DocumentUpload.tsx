import React from "react";
import { LucideIcon } from "lucide-react";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

export type DocumentType =
  | "background"
  | "jobdesc"
  | "jobposting"
  | "emails"
  | "notes"
  | "companypolicy";

interface DocumentUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  type: DocumentType;
  inputId: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onView: (file: File, type: DocumentType) => void;
  onDownload: (file: File, filename: string) => void;
}

export function DocumentUpload({
  file,
  setFile,
  uploading,
  setUploading,
  type,
  inputId,
  icon: Icon,
  iconBg,
  iconColor,
  onView,
  onDownload,
}: DocumentUploadProps) {
  const { handleUpload, removeFile } = useDocumentUpload(setFile, setUploading);

  return !file ? (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
      <input
        type="file"
        id={inputId}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
        disabled={uploading}
      />
      <label htmlFor={inputId} className="cursor-pointer">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <p
            className="text-sm font-medium mb-1"
            style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}
          >
            {uploading ? "Uploading..." : "Click to upload"}
          </p>
          <p className="text-xs" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            PDF, JPEG, PNG, DOCX (max 10MB)
          </p>
        </div>
      </label>
    </div>
  ) : (
    <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
              {file.name}
            </p>
            <p className="text-xs" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onView(file, type)}
            className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
            style={{ color: "#3B82F6" }}
            title="View Document"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDownload(file, file.name)}
            className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
            style={{ color: "#10B981" }}
            title="Download Document"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </button>
          <button
            onClick={removeFile}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: "#E54747" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            title="Remove Document"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
