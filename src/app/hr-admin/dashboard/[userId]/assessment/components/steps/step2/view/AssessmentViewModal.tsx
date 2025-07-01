import React, { useState, useEffect } from "react";
import DocumentMetadata from "../../../documents/DocumentMetadata";
import PrintPreviewButton from "../../../documents/PrintButton";
import { DocumentDataService, AssessmentData } from "@/lib/services/documentDataService";

interface AssessmentViewModalProps {
  open: boolean;
  candidateId: string;
  onClose: () => void;
}

const AssessmentViewModal: React.FC<AssessmentViewModalProps> = ({
  open,
  candidateId,
  onClose,
}) => {
  const [documentData, setDocumentData] = useState<AssessmentData | null>(null);
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
      console.log('[AssessmentViewModal] Fetching document data for candidate:', candidateId);
      const data = await DocumentDataService.getAssessmentData(candidateId);

      if (data) {
        setDocumentData(data);
        console.log('[AssessmentViewModal] Document data loaded:', data);
      } else {
        setError('Failed to load document data');
      }
    } catch (err) {
      console.error('[AssessmentViewModal] Error fetching document data:', err);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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

  const assessment = documentData.step2Data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Criminal History Individual Assessment Form
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

        {/* Saved Assessment Content */}
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
              <span style={{ color: "#595959" }}>{assessment.employer}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Applicant Name:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.applicant}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Position Applied For:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.position}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Conditional Offer:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.offerDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Assessment:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.assessmentDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Date of Criminal History Report:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.reportDate}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Assessment Performed by:</span>{" "}
              <span style={{ color: "#595959" }}>{assessment.performedBy}</span>
            </div>
          </div>

          <h3 className="font-bold mb-4 text-black text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
            ASSESSMENT
          </h3>
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-black">
                1. The specific duties and responsibilities of the job are:
              </span>
              <ul className="list-disc ml-6 mt-2" style={{ color: "#595959" }}>
                {assessment.duties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-black">
                2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question:
              </span>
              <div className="mt-2" style={{ color: "#595959" }}>{assessment.conduct}</div>
            </div>

            <div>
              <span className="font-semibold text-black">3. How long ago did the criminal activity occur:</span>
              <div className="mt-2" style={{ color: "#595959" }}>{assessment.howLongAgo}</div>
            </div>

            <div>
              <span className="font-semibold text-black">
                4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:
              </span>
              <ul className="list-disc ml-6 mt-2" style={{ color: "#595959" }}>
                {assessment.activities.map((act: string, idx: number) => act && <li key={idx}>{act}</li>)}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-black">Based on the factors above, we are considering rescinding our offer of employment because:</span>
              <div className="mt-2" style={{ color: "#595959" }}>{assessment.rescindReason}</div>
            </div>
          </div>

          <DocumentMetadata
            sentDate={assessment.sentAt}
            hrAdminName={documentData.hrAdminProfile ? `${documentData.hrAdminProfile.first_name} ${documentData.hrAdminProfile.last_name}` : ''}
            companyName={documentData.hrAdminProfile?.company || ''}
            candidateId={candidateId}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 mt-6">
          <PrintPreviewButton documentSelector=".prose" documentTitle="Individualized Assessment Form" />
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

export default AssessmentViewModal;
