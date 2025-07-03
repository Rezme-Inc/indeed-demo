import React, { useState, useEffect } from "react";
import DocumentMetadata from "../../../documents/DocumentMetadata";
import PrintPreviewButton from "../../../documents/PrintButton";
import { DocumentDataService, FinalRevocationData } from "@/lib/services/documentDataService";

interface FinalRevocationViewModalProps {
  open: boolean;
  candidateId: string;
  onClose: () => void;
}

const FinalRevocationViewModal: React.FC<FinalRevocationViewModalProps> = ({
  open,
  candidateId,
  onClose,
}) => {
  const [documentData, setDocumentData] = useState<FinalRevocationData | null>(null);
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
      console.log('[FinalRevocationViewModal] Fetching document data for candidate:', candidateId);
      const data = await DocumentDataService.getFinalRevocationData(candidateId);

      if (data) {
        setDocumentData(data);
        console.log('[FinalRevocationViewModal] Document data loaded:', data);
      } else {
        setError('Failed to load document data');
      }
    } catch (err) {
      console.error('[FinalRevocationViewModal] Error fetching document data:', err);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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

  const notice = documentData.step5Data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Notice of Final Decision to Revoke Job Offer Because of Conviction History
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

        {/* Saved Final Revocation Notice Content */}
        <div
          className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            {notice.date}
          </div>
          <div className="mb-6 font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Re: Final Decision to Revoke Job Offer Because of Conviction History
          </div>
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Dear {notice.applicant || "[APPLICANT NAME]"}:
          </div>
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            We are following up about our letter dated {notice.dateOfNotice || "[DATE OF NOTICE]"} which notified you of our initial decision to revoke (take back) the conditional job offer:
          </div>
          <div className="mb-6 font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            (Please check one:)
          </div>
          <ul className="list-disc ml-6" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            {notice.noResponse && (
              <li>
                We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
              </li>
            )}
            {notice.infoSubmitted && (
              <li>
                We made a final decision to revoke the job offer after considering the information you submitted, which included: {notice.infoSubmittedList}
              </li>
            )}
          </ul>
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            After reviewing the information you submitted, we have determined that there
            <span className="font-semibold text-black">
              {" "}
              {notice.errorOnReport === "was" ? "was" : notice.errorOnReport === "was not" ? "was not" : "[check one]"}
            </span>{" "}
            (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):
          </div>
          <ul className="list-disc ml-6" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            {notice.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
          </ul>
          <div className="mb-6 font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Our Individualized Assessment:
          </div>
          <ol className="list-decimal ml-8 mb-8 space-y-4" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            <li>
              The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {notice.seriousReason}
            </li>
            <li>
              How long ago the conduct occurred that led to your conviction, which was: {notice.timeSinceConduct} and how long ago you completed your sentence, which was: {notice.timeSinceSentence}.
            </li>
            <li>
              The specific duties and responsibilities of the position of {notice.position}, which are:
              <ul className="list-disc ml-6">
                {notice.jobDuties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
              </ul>
            </li>
          </ol>
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:
          </div>
          <div className="mb-6" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            {notice.fitnessReason}
          </div>
          <div className="mb-6 font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Request for Reconsideration:
          </div>
          <ul className="list-disc ml-6" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            {notice.reconsideration === "none" && <li>We do not offer any way to challenge this decision or request reconsideration.</li>}
            {notice.reconsideration === "procedure" && (
              <li>
                If you would like to challenge this decision or request reconsideration, you may: {notice.reconsiderationProcedure}
              </li>
            )}
          </ul>
          <div className="mb-6 font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Your Right to File a Complaint:
          </div>
          <div className="mb-6" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            You also have the right to file a complaint with the Enforcement Unit of the San Diego County Office of Labor Standards and Enforcement within 180 days after the alleged violation of the San Diego County Fair Chance Ordinance. To file a complaint online or request information, visit the Office of Labor Standards and Enforcement online. You may also file a complaint by calling 858-694-2440.
          </div>
          <div className="mb-6 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Sincerely,
            <br />
            {notice.contactName}
            <br />
            {notice.companyName}
            <br />
            {notice.address}
            <br />
            {notice.phone}
          </div>

          <DocumentMetadata
            sentDate={notice.sentAt}
            hrAdminName={documentData.hrAdminProfile ? `${documentData.hrAdminProfile.first_name} ${documentData.hrAdminProfile.last_name}` : ''}
            companyName={documentData.hrAdminProfile?.company || ''}
            candidateId={candidateId}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <PrintPreviewButton documentSelector=".prose" documentTitle="Final Job Revocation Notice" />
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

export default FinalRevocationViewModal;
