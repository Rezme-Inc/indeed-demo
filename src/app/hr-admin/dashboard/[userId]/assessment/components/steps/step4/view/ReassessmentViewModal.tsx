import React, { useState, useEffect } from "react";
import DocumentMetadata from "../../../documents/DocumentMetadata";
import PrintPreviewButton from "../../../documents/PrintButton";
import { DocumentDataService, ReassessmentData } from "@/lib/services/documentDataService";

interface ReassessmentViewModalProps {
  open: boolean;
  candidateId: string;
  onClose: () => void;
}

const ReassessmentViewModal: React.FC<ReassessmentViewModalProps> = ({
  open,
  candidateId,
  onClose,
}) => {
  const [documentData, setDocumentData] = useState<ReassessmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch document data when modal opens
  useEffect(() => {
    if (open && candidateId) {
      fetchDocumentData();
    }
  }, [open, candidateId]);

  const fetchDocumentData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[ReassessmentViewModal] Fetching document data for candidate:', candidateId);
      const data = await DocumentDataService.getReassessmentData(candidateId);

      if (data) {
        setDocumentData(data);
        console.log('[ReassessmentViewModal] Document data loaded:', data);
      } else {
        setError('Failed to load document data');
      }
    } catch (err) {
      console.error('[ReassessmentViewModal] Error fetching document data:', err);
      setError('Error loading document data');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading document data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            {error || 'Document not found'}
          </p>
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
            onClick={onClose}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const reassessment = documentData.step4Data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Individualized Reassessment Form
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Saved Reassessment Content */}
        <div
          className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-bold mb-4 text-black text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
            INFORMATION
          </h3>
          <div className="space-y-2 mb-6">
            <div>
              <span className="font-semibold text-black">Employer Name:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.employer}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Applicant Name:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.applicant}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Position Applied For:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.position}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Conditional Offer:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.offerDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Reassessment:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.reassessmentDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Criminal History Report:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.reportDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Assessment Performed by:</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.performedBy}</span>
            </div>
          </div>

          <h3 className="font-bold mt-6 mb-4 text-black text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
            REASSESSMENT
          </h3>
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-black">1. Was there an error in the Criminal History Report?</span>{" "}
              <span style={{ color: "#595959" }}>{reassessment.errorYesNo}</span>
            </div>
            {reassessment.errorYesNo === "Yes" && (
              <div>
                <span className="font-semibold text-black">If yes, describe the error:</span>{" "}
                <span style={{ color: "#595959" }}>{reassessment.error}</span>
              </div>
            )}

            <div>
              <span className="font-semibold text-black">2. Evidence of rehabilitation and good conduct:</span>
              <div className="mt-2 space-y-2">
                {reassessment.evidenceA && (
                  <div>
                    <span className="font-semibold text-black">a.</span>{" "}
                    <span style={{ color: "#595959" }}>{reassessment.evidenceA}</span>
                  </div>
                )}
                {reassessment.evidenceB && (
                  <div>
                    <span className="font-semibold text-black">b.</span>{" "}
                    <span style={{ color: "#595959" }}>{reassessment.evidenceB}</span>
                  </div>
                )}
                {reassessment.evidenceC && (
                  <div>
                    <span className="font-semibold text-black">c.</span>{" "}
                    <span style={{ color: "#595959" }}>{reassessment.evidenceC}</span>
                  </div>
                )}
                {reassessment.evidenceD && (
                  <div>
                    <span className="font-semibold text-black">d.</span>{" "}
                    <span style={{ color: "#595959" }}>{reassessment.evidenceD}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="font-semibold text-black">Decision:</span>{" "}
              <span style={{ color: "#595959" }}>
                {reassessment.decision === "rescind" ? "Rescind Offer" : "Extend Offer"}
              </span>
            </div>

            <div>
              {reassessment.decision === "rescind" ? (
                <>
                  <span className="font-semibold text-black">Based on the factors above, we are rescinding our offer of employment because:</span>
                  <br />
                  <span style={{ color: "#595959" }}>{reassessment.rescindReason}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-black">Based on the factors above, we are extending our offer of employment.</span>
                  <br />
                  <span style={{ color: "#595959" }}>{reassessment.extendReason}</span>
                </>
              )}
            </div>
          </div>

          <DocumentMetadata
            sentDate={reassessment.sentAt}
            hrAdminName={documentData.hrAdminProfile ? `${documentData.hrAdminProfile.first_name} ${documentData.hrAdminProfile.last_name}` : ''}
            companyName={documentData.hrAdminProfile?.company || ''}
            candidateId={candidateId}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <PrintPreviewButton documentSelector=".prose" documentTitle="Individualized Reassessment Form" />
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            onClick={onClose}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassessmentViewModal;
