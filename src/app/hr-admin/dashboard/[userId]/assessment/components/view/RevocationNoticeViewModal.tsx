import React from "react";
import DocumentMetadata from "../DocumentMetadata";
import PrintPreviewButton from "../PrintButton";

interface RevocationNoticeViewModalProps {
  open: boolean;
  notice: any | null;
  onClose: () => void;
}

const RevocationNoticeViewModal: React.FC<RevocationNoticeViewModalProps> = ({
  open,
  notice,
  onClose,
}) => {
  if (!open || !notice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History
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

        {/* Saved Revocation Notice Content */}
        <div
          className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            {notice.date}
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Re: Preliminary Decision to Revoke Job Offer Because of Conviction History
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Dear {notice.applicant}:
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            After reviewing the results of your conviction history background check, we have made a preliminary (non-final) decision to revoke (take back) our previous job offer for the position of {notice.position} because of the following conviction(s):
            <ul className="list-disc ml-6" style={{ color: "#595959" }}>
              {notice.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
            </ul>
            A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            As prohibited by Local and California law, we have NOT considered any of the following:
            <ul className="list-disc ml-6" style={{ color: "#595959" }}>
              <li>Arrest(s) not followed by conviction;</li>
              <li>Participation in a pretrial or posttrial diversion program; or</li>
              <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
            </ul>
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className="font-semibold">Your Right to Respond:</span>
            <br />
            The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final. Within {notice.numBusinessDays} business days* from when you first receive this notice, you may send us:
            <ul className="list-disc ml-6" style={{ color: "#595959" }}>
              <li>Evidence of rehabilitation or mitigating circumstances</li>
              <li>
                Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.
              </li>
            </ul>
            Please send any additional information you would like us to consider to: {notice.contactName}, {notice.companyName}, {notice.address}, {notice.phone}
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. We will notify you in writing if we make a final decision to revoke the job offer.
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className="font-semibold">Our Individualized Assessment:</span>
            <br />
            We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
            <ol className="list-decimal ml-6" style={{ color: "#595959" }}>
              <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {notice.seriousReason}</li>
              <li>How long ago the conduct occurred that led to your conviction, which was: {notice.timeSinceConduct} and how long ago you completed your sentence, which was: {notice.timeSinceSentence}.</li>
              <li>
                The specific duties and responsibilities of the position of {notice.position}, which are: {notice.jobDuties}
              </li>
            </ol>
            We believe your conviction record lessens your fitness/ability to perform the job duties because: {notice.fitnessReason}
          </div>
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
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
          <div className="mb-2 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Enclosure: Copy of conviction history report
          </div>
          <div className="mb-2 text-xs text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            * The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information
          </div>

          <DocumentMetadata
            sentDate={notice.sentAt}
            hrAdminName={notice.hrAdminName}
            companyName={notice.companyName}
            candidateId={notice.candidateId}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <PrintPreviewButton documentSelector=".prose" documentTitle="Job Revocation Notice" />
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

export default RevocationNoticeViewModal;
