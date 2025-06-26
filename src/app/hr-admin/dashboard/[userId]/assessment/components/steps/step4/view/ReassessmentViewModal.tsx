import React from "react";
import DocumentMetadata from "../../../documents/DocumentMetadata";
import PrintPreviewButton from "../../../documents/PrintButton";

interface ReassessmentViewModalProps {
  open: boolean;
  reassessment: any | null;
  onClose: () => void;
}

const ReassessmentViewModal: React.FC<ReassessmentViewModalProps> = ({
  open,
  reassessment,
  onClose,
}) => {
  if (!open || !reassessment) return null;
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
            hrAdminName={reassessment.hrAdminName}
            companyName={reassessment.companyName}
            candidateId={reassessment.candidateId}
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
