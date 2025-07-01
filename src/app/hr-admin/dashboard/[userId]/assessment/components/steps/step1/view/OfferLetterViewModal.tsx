import React, { useState, useEffect } from "react";
import DocumentMetadata from "../../../documents/DocumentMetadata";
import PrintPreviewButton from "../../../documents/PrintButton";
import { DocumentDataService, OfferLetterData } from "@/lib/services/documentDataService";

interface OfferLetterViewModalProps {
  open: boolean;
  candidateId: string;
  onClose: () => void;
}

const OfferLetterViewModal: React.FC<OfferLetterViewModalProps> = ({
  open,
  candidateId,
  onClose,
}) => {
  const [documentData, setDocumentData] = useState<OfferLetterData | null>(null);
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
      console.log('[OfferLetterViewModal] Fetching document data for candidate:', candidateId);
      const data = await DocumentDataService.getOfferLetterData(candidateId);

      if (data) {
        setDocumentData(data);
        console.log('[OfferLetterViewModal] Document data loaded:', data);
      } else {
        setError('Failed to load document data');
      }
    } catch (err) {
      console.error('[OfferLetterViewModal] Error fetching document data:', err);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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

  const offerLetter = documentData.step1Data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold text-black"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Conditional Job Offer Letter
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

        {/* Saved Offer Letter Content */}
        <div
          className="prose max-w-none text-black text-base bg-white"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="mb-2">
            <span className="font-semibold">{offerLetter.date}</span>
          </div>
          <div className="mb-2">
            RE: Conditional Offer of Employment &amp; Notice of Conviction Background Check
          </div>
          <div className="mb-2">
            Dear <span className="font-semibold">{offerLetter.applicant}</span>:
          </div>
          <div className="mb-2">
            We are writing to make you a conditional offer of employment for the position of <span className="font-semibold">{offerLetter.position}</span>. Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
          </div>
          <div className="mb-2">
            After reviewing your conviction history report, we will either:
            <br />a. Notify you that this conditional job offer has become final; or
            <br />b. Notify you in writing that we intend to revoke (take back) this job offer because of your conviction history.
          </div>
          <div className="mb-2">
            As required by California state and San Diego County law, we will NOT consider any of the following information:
            <br />• Arrest not followed by conviction;
            <br />• Referral to or participation in a pretrial or posttrial diversion program; or
            <br />• Convictions that have been sealed, dismissed, expunged, or pardoned.
          </div>
          <div className="mb-2">
            As required by the California Fair Chance Act and the San Diego County Fair Chance Ordinance, we will consider whether your conviction history is directly related to the duties of the job we have offered you. We will consider all of the following:
            <br />• The nature and seriousness of the offense
            <br />• The amount of time since the offense
            <br />• The nature of the job
          </div>
          <div className="mb-2">
            We will notify you in writing if we plan to revoke (take back) this job offer after reviewing your conviction history. That decision will be preliminary, and you will have an opportunity to respond before it becomes final. We will identify conviction(s) that concern us, give you a copy of the background check report, as well as a copy of the written individualized assessment of the report and the relevance of your history to the position. We will then hold the position open, except in emergent circumstances to allow you at least 5 business days to provide information about your rehabilitation or mitigating circumstances and/or provide notice that you will provide information showing the conviction history report is inaccurate. Should you provide notice that you will provide information showing the conviction history report is inaccurate, you will have an additional 5 business days to provide that evidence. Should you provide additional information, we will then conduct a written individualized reassessment and decide whether to finalize or take back this conditional job offer. We will notify you of that decision in writing.
          </div>
          <div className="mb-2">
            Sincerely,
            <br />
            <span className="font-semibold">{offerLetter.employer}</span>
          </div>
          <div className="mb-2">
            Enclosure: Authorization for Background Check (as required by the U.S. Fair Credit Reporting Act and California Investigative Consumer Reporting Agencies Act)
          </div>

          {/* Document Metadata */}
          <DocumentMetadata
            sentDate={offerLetter.sentDate}
            hrAdminName={documentData.hrAdminProfile ? `${documentData.hrAdminProfile.first_name} ${documentData.hrAdminProfile.last_name}` : ''}
            companyName={documentData.hrAdminProfile?.company || ''}
            candidateId={candidateId}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 mt-6">
          <PrintPreviewButton documentSelector=".prose" documentTitle="Conditional Job Offer" />
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

export default OfferLetterViewModal;
