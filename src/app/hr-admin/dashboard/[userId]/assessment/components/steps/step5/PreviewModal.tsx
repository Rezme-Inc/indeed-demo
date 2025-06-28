import React from "react";

interface PreviewModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  part1Data: any;
  part2Data: any;
  part3Data: any;
  part4Data: any;
  onBack: () => void;
  onSend: () => void;
}

function isStep5Complete(part1Data: any, part2Data: any, part3Data: any, part4Data: any) {
  // Check Part 1 completion
  if (!part1Data?.date || !part1Data?.applicant || !part1Data?.dateOfNotice) {
    return false;
  }

  // Check Part 2 completion - at least one conviction must be filled
  if (!part2Data?.convictions || !Array.isArray(part2Data.convictions) ||
    part2Data.convictions.filter((c: string) => c && c.trim() !== "").length === 0) {
    return false;
  }

  // Check Part 3 completion
  if (!part3Data?.position || !part3Data?.jobDuties || !Array.isArray(part3Data.jobDuties) ||
    part3Data.jobDuties.filter((d: string) => d && d.trim() !== "").length === 0 ||
    !part3Data?.timeSinceConduct || !part3Data?.timeSinceSentence || !part3Data?.seriousReason) {
    return false;
  }

  // Check Part 4 completion
  if (!part4Data?.fitnessReason || !part4Data?.contactName || !part4Data?.companyName) {
    return false;
  }

  // If user selected reconsideration procedure, they must fill in the procedure field
  if (part4Data.reconsideration === 'procedure' && (!part4Data.reconsiderationProcedure || part4Data.reconsiderationProcedure.trim() === '')) {
    return false;
  }

  return true;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  showModal,
  setShowModal,
  part1Data,
  part2Data,
  part3Data,
  part4Data,
  onBack,
  onSend,
}) => {
  if (!showModal) return null;

  const isComplete = isStep5Complete(part1Data, part2Data, part3Data, part4Data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Review Final Revocation Notice</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Please review all information before sending</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="text-center mb-6">
            <h3 className="font-bold text-xl underline">Sample Employer Notice of Final Decision to Revoke Job Offer Because of Conviction History</h3>
          </div>

          <div className="mb-4">
            <span className="font-bold">{part1Data?.date || 'DATE'}</span>
          </div>

          <div className="mb-4">
            <span className="font-bold">Re: Final Decision to Revoke Job Offer Because of Conviction History</span>
          </div>

          <div className="mb-4">
            Dear <span className="font-bold">{part1Data?.applicant || 'APPLICANT NAME'}</span>:
          </div>

          <div className="mb-4">
            We are following up about our letter dated <span className="font-bold">{part1Data?.dateOfNotice || 'DATE OF NOTICE'}</span> which notified you of our initial decision to revoke (take back) the conditional job offer:
          </div>

          <div className="mb-4">
            (Please check one:)
          </div>

          <div className="ml-8 mb-4">
            <div className="mb-2">
              {part2Data?.noResponse ? '☑' : '☐'} We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
            </div>
            <div className="mb-2">
              {part2Data?.infoSubmitted ? '☑' : '☐'} We made a final decision to revoke the job offer after considering the information you submitted, which included: <span className="font-bold">{part2Data?.infoSubmittedList || 'LIST INFORMATION SUBMITTED'}</span>
            </div>
          </div>

          <div className="mb-4">
            After reviewing the information you submitted, we have determined that there {part2Data?.errorOnReport === 'was' ? '☑ was' : '☐ was'} {part2Data?.errorOnReport === 'was not' ? '☑ was not' : '☐ was not'} (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):
          </div>

          <div className="ml-8 mb-4">
            <ul className="list-disc">
              {part2Data?.convictions && part2Data.convictions.map((conviction: string, idx: number) =>
                conviction && conviction.trim() !== "" && <li key={idx}><span className="font-bold">{conviction}</span></li>
              )}
            </ul>
          </div>

          <div className="mb-4">
            <span className="font-bold underline">Our Individualized Assessment:</span><br />
            We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
          </div>

          <div className="ml-4 mb-4">
            <div className="mb-2">
              1. The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <span className="font-bold">{part3Data?.seriousReason || 'DESCRIBE WHY CONSIDERED SERIOUS'}</span>
            </div>
            <div className="mb-2">
              2. How long ago the conduct occurred that led to your conviction, which was: <span className="font-bold">{part3Data?.timeSinceConduct || 'INSERT AMOUNT OF TIME PASSED'}</span> and how long ago you completed your sentence, which was: <span className="font-bold">{part3Data?.timeSinceSentence || 'INSERT AMOUNT OF TIME PASSED'}</span>.
            </div>
            <div className="mb-2">
              3. The specific duties and responsibilities of the position of <span className="font-bold">{part3Data?.position || 'INSERT POSITION'}</span>, which are: <span className="font-bold">{part3Data?.jobDuties && part3Data.jobDuties.filter((d: string) => d && d.trim() !== "").join(', ') || 'LIST JOB DUTIES'}</span>
            </div>
          </div>

          <div className="mb-6">
            We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because: <span className="font-bold">{part4Data?.fitnessReason || 'OUTLINE REASONING FOR DECISION TO REVOKE JOB OFFER BASED ON RELEVANCE OF CONVICTION HISTORY TO POSITION'}</span>
          </div>

          <div className="mb-4">
            <span className="font-bold underline">Request for Reconsideration:</span>
          </div>

          <div className="mb-4">
            (Please check one:)
          </div>

          <div className="ml-8 mb-6">
            <div className="mb-2">
              {part4Data?.reconsideration === 'none' ? '☑' : '☐'} We do not offer any way to challenge this decision or request reconsideration.
            </div>
            <div className="mb-2">
              {part4Data?.reconsideration === 'procedure' ? '☑' : '☐'} If you would like to challenge this decision or request reconsideration, you may: <span className="font-bold">{part4Data?.reconsiderationProcedure || 'DESCRIBE INTERNAL PROCEDURE'}</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="font-bold underline">Your Right to File a Complaint:</span>
          </div>

          <div className="mb-4">
            If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
          </div>

          <div className="ml-4 mb-4">
            <div className="mb-2">
              <span className="font-bold">• California CRD:</span>
              <div className="ml-4">
                <div>○ File a complaint online at the following link: ccrs.calcivilrights.ca.gov/s/</div>
                <div>○ Download an intake form at the following link: calcivilrights.ca.gov/complaintprocess/filebymail/ and email it to contact.center@calcivilrights.gov or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</div>
                <div>○ Visit a CRD office. Click the following link for office locations: calcivilrights.ca.gov/locations/</div>
                <div>○ Call California CRD at (800) 884-1684</div>
              </div>
            </div>
            <div className="mb-2">
              <span className="font-bold">• San Diego County OLSE:</span>
              <div className="ml-4">
                <div>○ File a complaint online at the following link: www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</div>
                <div>○ Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</div>
                <div>○ Call San Diego County OLSE at 619-531-5129</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            For more information, visit www.sandiegocounty.gov/content/sdc/OLSE<br />
            Sincerely,
          </div>

          <div className="mb-2">
            <span className="font-bold">{part4Data?.contactName || 'Employer contact person name'}</span>
          </div>

          <div className="mb-2">
            <span className="font-bold">{part4Data?.companyName || 'Employer company name'}</span>
          </div>

          <div className="mb-2">
            <span className="font-bold">{part4Data?.address || 'Employer address'}</span>
          </div>

          <div className="mb-2">
            <span className="font-bold">{part4Data?.phone || 'Employer contact phone number'}</span>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Save for Later
          </button>
          <div className="flex gap-4 items-center">
            {!isComplete && (
              <span className="text-red-600 text-sm font-semibold mr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                All fields must be filled before sending.
              </span>
            )}
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Back to Edit
            </button>
            <button
              type="button"
              className={`px-8 py-3 rounded text-lg font-semibold ${isComplete
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              onClick={onSend}
              disabled={!isComplete}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Send Final Revocation Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal; 
