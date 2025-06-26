import React from "react";
import { FileText, Building, Briefcase, Mail, StickyNote } from "lucide-react";
import { useDocumentUploads } from "@/context/useDocumentUploads";
import { useDocumentHandlers } from "@/hooks/useDocumentHandlers";

const DocumentViewer: React.FC = () => {
  const {
    viewingDocument,
    showDocumentViewer,
    setShowDocumentViewer,
    setViewingDocument,
  } = useDocumentUploads();
  const { downloadDocument, getFilePreviewUrl } = useDocumentHandlers();

  if (!showDocumentViewer || !viewingDocument) return null;


  const close = () => {
    setShowDocumentViewer(false);
    setViewingDocument(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] relative border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                viewingDocument.type === "background"
                  ? "bg-red-50"
                  : viewingDocument.type === "jobdesc"
                  ? "bg-blue-50"
                  : viewingDocument.type === "jobposting"
                  ? "bg-green-50"
                  : viewingDocument.type === "emails"
                  ? "bg-purple-50"
                  : viewingDocument.type === "notes"
                  ? "bg-yellow-50"
                  : "bg-gray-50"
              }`}
            >
              {viewingDocument.type === "background" ? (
                <FileText className="h-5 w-5" style={{ color: "#E54747" }} />
              ) : viewingDocument.type === "jobdesc" ? (
                <Building className="h-5 w-5 text-blue-600" />
              ) : viewingDocument.type === "jobposting" ? (
                <Briefcase className="h-5 w-5 text-green-600" />
              ) : viewingDocument.type === "emails" ? (
                <Mail className="h-5 w-5 text-purple-600" />
              ) : viewingDocument.type === "notes" ? (
                <StickyNote className="h-5 w-5 text-yellow-600" />
              ) : (
                <Building className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                {viewingDocument.title}
              </h2>
              <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                {viewingDocument.file.name} • {(viewingDocument.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadDocument(viewingDocument.file, viewingDocument.file.name)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200" onClick={close}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden">
          {viewingDocument.file.type === "application/pdf" ? (
            /* PDF Viewer */
            <iframe src={getFilePreviewUrl(viewingDocument.file)} className="w-full h-[70vh] border-0" title={`${viewingDocument.title} Preview`} />
          ) : viewingDocument.file.type.startsWith("image/") ? (
            /* Image Viewer */
            <div className="flex items-center justify-center p-8 h-[70vh] bg-gray-50">
              <img src={getFilePreviewUrl(viewingDocument.file)} alt={viewingDocument.title} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" />
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
                onClick={() => downloadDocument(viewingDocument.file, viewingDocument.file.name)}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            <div>File Type: {viewingDocument.file.type || "Unknown"} • Size: {(viewingDocument.file.size / 1024 / 1024).toFixed(2)} MB</div>
            <div className="flex items-center gap-4">
              <span>Uploaded: {new Date().toLocaleDateString()}</span>
              <span className="text-green-600 font-medium">✓ Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
