import React from "react";
import { FileText, Download, X } from "lucide-react";
import { UploadedFile } from "@/lib/services/fileStorageService";

interface StoredDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFile | null;
  fileUrl: string | null;
}

const StoredDocumentViewer: React.FC<StoredDocumentViewerProps> = ({
  isOpen,
  onClose,
  file,
  fileUrl,
}) => {
  if (!isOpen || !file || !fileUrl) return null;

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = getDisplayFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDisplayFileName = () => {
    // Extract filename from bucket_path (format: hr_id/candidate_id/filename)
    const pathParts = file.bucket_path.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // Make it more readable
    return fileName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFileTypeDisplayName = () => {
    switch (file.file_type) {
      case 'job_desc':
        return 'Job Description';
      case 'offer_letter':
        return 'Offer Letter';
      case 'background_report':
        return 'Background Report';
      case 'evidence':
        return 'Evidence Document';
      default:
        return 'Document';
    }
  };

  const getFileIcon = () => {
    return <FileText className="h-5 w-5" style={{ color: "#E54747" }} />;
  };

  const getFileSizeMB = () => {
    return (file.file_size / 1024 / 1024).toFixed(2);
  };

  const isPDF = () => {
    return file.mime_type === 'application/pdf';
  };

  const isImage = () => {
    return file.mime_type?.startsWith('image/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] relative border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-red-50">
              {getFileIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                {getFileTypeDisplayName()}
              </h2>
              <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                {getDisplayFileName()} • {getFileSizeMB()} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden">
          {isPDF() ? (
            /* PDF Viewer */
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0"
              title={`${getFileTypeDisplayName()} Preview`}
            />
          ) : isImage() ? (
            /* Image Viewer */
            <div className="flex items-center justify-center p-8 h-[70vh] bg-gray-50">
              <img
                src={fileUrl}
                alt={getFileTypeDisplayName()}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            </div>
          ) : (
            /* Unsupported File Type */
            <div className="flex flex-col items-center justify-center p-12 h-[70vh] bg-gray-50">
              <div className="h-16 w-16 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Preview Not Available
              </h3>
              <p className="text-center mb-6 max-w-md" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                This file type cannot be previewed in the browser. You can download the file to view it in an appropriate application.
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
              >
                <Download className="h-4 w-4" />
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            <div>File Type: {file.mime_type} • Size: {getFileSizeMB()} MB</div>
            <div className="flex items-center gap-4">
              <span>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</span>
              <span className="text-green-600 font-medium">✓ Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoredDocumentViewer; 
