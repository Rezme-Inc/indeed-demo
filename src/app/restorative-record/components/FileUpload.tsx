import React, { useState } from "react";
import { validateFileSize, MAX_FILE_SIZE } from "../utils";

interface FileUploadProps {
  id: string;
  filePreview: string;
  error?: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
  onError: (error: string) => void;
  fileName?: string;
  fileSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  filePreview,
  error,
  maxSize = MAX_FILE_SIZE,
  onChange,
  onError,
  fileName,
  fileSize,
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
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

  const handleDeleteFile = () => {
    onChange(null);
    onError("");
  };

  const handleReplaceFile = () => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handlePreviewFile = () => {
    if (!filePreview) return;
    
    // Check if it's a PDF by file extension or content type
    const isPDF = fileName?.toLowerCase().endsWith('.pdf') || 
                  filePreview.includes('.pdf') || 
                  filePreview.includes('application/pdf') ||
                  filePreview.includes('data:application/pdf');
    
    if (isPDF) {
      // For PDFs, open in new tab
      window.open(filePreview, "_blank");
    } else {
      // For images, show modal
      setShowPreviewModal(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Better detection for file types
  const isImage = () => {
    if (!filePreview) return false;
    
    // Check by filename extension
    if (fileName) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      const fileExt = fileName.toLowerCase();
      if (imageExtensions.some(ext => fileExt.endsWith(ext))) {
        return true;
      }
    }
    
    // Check by file preview URL or data URL
    return filePreview.includes("image") || 
           filePreview.includes("data:image") ||
           /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i.test(filePreview);
  };

  const isPDF = () => {
    if (!filePreview) return false;
    
    // Check by filename extension first
    if (fileName?.toLowerCase().endsWith('.pdf')) {
      return true;
    }
    
    // Check by URL or data URL
    return filePreview.includes("pdf") || 
           filePreview.includes("application/pdf") ||
           /\.pdf(\?|$)/i.test(filePreview);
  };

  const isImageFile = isImage();
  const isPDFFile = isPDF();

  return (
    <div>
      <label className="block font-medium mb-1">
        Upload optional supporting file (image or pdf)
      </label>
      
      {!filePreview ? (
        // Upload area when no file is present
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
        </label>
      ) : (
        // File management area when file is present
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {isImageFile ? (
                <img
                  src={filePreview}
                  alt="File preview"
                  className="w-12 h-12 object-cover rounded border"
                />
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded border flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {fileName || "Uploaded file"}
                </p>
                {fileSize && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePreviewFile}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                title="Preview file"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              
              <button
                type="button"
                onClick={handleReplaceFile}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                title="Replace file"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Replace
              </button>
              
              <button
                type="button"
                onClick={handleDeleteFile}
                className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Delete file"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
          
          {/* Hidden file input for replace functionality */}
          <input
            id={id}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      
      {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
      
      {/* Preview Modal for Images */}
      {showPreviewModal && isImageFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPreviewModal(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
              title="Close preview"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={filePreview}
              alt="File preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
