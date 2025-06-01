import React from "react";
import { validateFileSize } from "../utils";

interface FileUploadProps {
  id: string;
  filePreview: string;
  error?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  filePreview,
  error,
  maxSize = 5 * 1024 * 1024,
  onChange,
  onError,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFileSize(file, maxSize);
      if (!validation.isValid) {
        onError(validation.error || "");
        return;
      }
      onError("");
      onChange(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validation = validateFileSize(file, maxSize);
      if (!validation.isValid) {
        onError(validation.error || "");
        return;
      }
      onError("");
      onChange(file);
    }
  };

  const handleFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <label className="block font-medium mb-1">
        Upload optional supporting file (image or pdf)
      </label>
      <label
        htmlFor={id}
        onDrop={handleFileDrop}
        onDragOver={handleFileDragOver}
        className="block cursor-pointer border-dashed border-2 border-gray-200 rounded-lg min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-primary"
      >
        <input
          id={id}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {!filePreview && (
          <>
            <svg
              className="w-10 h-10 text-gray-300 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
            <span className="text-secondary text-sm">
              Click to upload or drag and drop
              <br />
              Images or PDF (max {maxSize / (1024 * 1024)}MB)
            </span>
          </>
        )}
        {filePreview && (
          <div className="mt-2 w-full flex flex-col items-center">
            {filePreview.includes("image") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="max-h-32 mx-auto"
              />
            ) : (
              <a
                href={filePreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-red-600"
              >
                View PDF
              </a>
            )}
          </div>
        )}
        {error && <div className="text-primary text-xs mt-2">{error}</div>}
      </label>
    </div>
  );
};
