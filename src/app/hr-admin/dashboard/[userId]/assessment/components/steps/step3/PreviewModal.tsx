import React from "react";

interface PreviewModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  part1Data: any;
  part2Data: any;
  part3Data: any;
  part4Data: any;
  candidateProfile: any;
  hrAdmin: any;
  step1Storage: any;
  onBack: () => void;
  onSend: () => void;
}

function isStep3Complete(part1Data: any, part2Data: any, part3Data: any, part4Data: any) {
  // Check Part 1 completion
  if (!part1Data?.applicantName || !part1Data?.position || !part1Data?.contactName ||
    !part1Data?.companyName || !part1Data?.address || !part1Data?.phone || !part1Data?.date) {
    return false;
  }

  // Check Part 2 completion
  if (!part2Data?.convictions || !Array.isArray(part2Data.convictions) ||
    part2Data.convictions.filter((c: string) => c && c.trim() !== "").length === 0 ||
    !part2Data?.conductTimeAgo || !part2Data?.sentenceCompletedTimeAgo) {
    return false;
  }

  // Check Part 3 completion
  if (!part3Data?.jobDuties || !part3Data?.seriousnessReason || !part3Data?.revocationReason) {
    return false;
  }

  // Check Part 4 completion
  if (!part4Data?.businessDays || parseInt(part4Data.businessDays) < 5) {
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
  candidateProfile,
  hrAdmin,
  step1Storage,
  onBack,
  onSend,
}) => {
  if (!showModal) return null;

  const isComplete = isStep3Complete(part1Data, part2Data, part3Data, part4Data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Review Revocation Notice</h2>
            <p className="text-gray-600 text-sm mt-1">Please review all information before sending</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="prose max-w-none text-gray-900 text-sm bg-white p-8 rounded border-2 border-gray-300" style={{ fontFamily: "Times New Roman, serif", lineHeight: "1.4" }}>
          <div className="text-center mb-6">
            <h3 className="font-bold text-lg underline mb-4">
              Sample Employer Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History
            </h3>
          </div>

          <div className="mb-4">
            <span className="px-1">{part1Data?.date || 'DATE'}</span>
          </div>

          <div className="mb-4">
            <strong>Re: Preliminary Decision to Revoke Job Offer Because of Conviction History</strong>
          </div>

          <div className="mb-4">
            Dear <span className="font-bold px-1">{part1Data?.applicantName || 'APPLICANT NAME'}</span>:
          </div>

          <div className="mb-4">
            After reviewing the results of your conviction history background check, we have made a{" "}
            <u><strong>preliminary</strong></u> (non-final) decision to revoke (take back) our previous job offer for the position of{" "}
            <span className="font-bold px-1">{part1Data?.position || 'INSERT POSITION'}</span> because of the following conviction(s):
          </div>

          <div className="ml-8 mb-4">
            {part2Data?.convictions && part2Data.convictions.length > 0 ? (
              <ul className="list-disc">
                {part2Data.convictions.map((conviction: string, idx: number) =>
                  conviction && conviction.trim() !== "" && (
                    <li key={idx} className="mb-1">
                      <span className="font-bold px-1">{conviction}</span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <ul className="list-disc">
                <li><span className="font-bold px-1">LIST CONVICTION(S) THAT LED TO DECISION TO REVOKE OFFER</span></li>
                <li></li>
                <li></li>
              </ul>
            )}
          </div>

          <div className="mb-4 italic">
            A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.
          </div>

          <div className="mb-4">
            As prohibited by Local and California law, we have NOT considered any of the following:
          </div>
          <div className="ml-8 mb-4">
            <ul className="list-disc">
              <li>Arrest(s) not followed by conviction;</li>
              <li>Participation in a pretrial or posttrial diversion program; or</li>
              <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
            </ul>
          </div>

          <div className="mb-2">
            <strong><u>Your Right to Respond:</u></strong>
          </div>
          <div className="mb-4">
            <em>The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final.</em> Within{" "}
            <span className="font-bold px-1">{part4Data?.businessDays || 'INSERT NUMBER'}</span> business days* from when you first receive this notice, you may send us:
          </div>

          <div className="ml-8 mb-4">
            <div className="mb-2">a. Evidence of rehabilitation or mitigating circumstances</div>
            <div className="mb-2">b. Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.</div>
          </div>

          <div className="mb-4">
            Please send any additional information you would like us to consider to:{" "}
            <span className="font-bold px-1">
              {part1Data?.contactName || 'INSERT NAME'} AND {part1Data?.address || 'MAILING ADDRESS'} OR EMAIL ADDRESS
            </span>
          </div>

          <div className="mb-4">
            Here are some examples of information you may send us:
          </div>
          <div className="ml-8 mb-4">
            <ul className="list-disc">
              <li className="mb-2">Evidence that you were not convicted of one or more of the offenses we listed above or that the conviction record is inaccurate (such as the number of convictions listed);</li>
              <li className="mb-2">Facts or circumstances surrounding the offense or conduct, showing that the conduct was less serious than the conviction seems;</li>
              <li className="mb-2">The time that has passed since the conduct that led to your conviction(s) or since your release from incarceration;</li>
              <li className="mb-2">The length and consistency of employment history or community involvement (such as volunteer activities) before and after the offense(s);</li>
              <li className="mb-2">Employment or character references from people who know you, such as letters from teachers, counselors, supervisors, clergy, and probation or parole officers;</li>
              <li className="mb-2">Evidence that you attended school, job training, or counseling;</li>
              <li className="mb-2">Evidence that you have performed the same type of work since your conviction;</li>
              <li className="mb-2">Whether you are bonded under a federal, state, or local bonding program; and</li>
              <li className="mb-2">Any other evidence of your rehabilitation efforts, such as (i) evidence showing how much time has passed since release from incarceration without subsequent conviction, (ii) evidence showing your compliance with the terms and conditions of probation or parole, or (iii) evidence showing your present fitness for the job.</li>
            </ul>
          </div>

          <div className="mb-4">
            We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. <em>We will notify you in writing if we make a final decision to revoke the job offer.</em>
          </div>

          <div className="mb-2">
            <strong><u>Our Individualized Assessment:</u></strong>
          </div>
          <div className="mb-4">
            We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
          </div>

          <div className="ml-8 mb-4">
            <div className="mb-4">
              <div className="mb-2">
                1. The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows:{" "}
                <span className="font-bold px-1">{part3Data?.seriousnessReason || 'DESCRIBE WHY CONSIDERED SERIOUS'}</span>
              </div>
              <div className="mb-2">
                2. How long ago the conduct occurred that led to your conviction, which was:{" "}
                <span className="font-bold px-1">{part2Data?.conductTimeAgo || 'INSERT AMOUNT OF TIME PASSED'}</span> and how long ago you completed your sentence, which was:{" "}
                <span className="font-bold px-1">{part2Data?.sentenceCompletedTimeAgo || 'INSERT AMOUNT OF TIME PASSED'}</span>.
              </div>
              <div className="mb-2">
                3. The specific duties and responsibilities of the position of{" "}
                <span className="font-bold px-1">{part1Data?.position || 'INSERT POSITION'}</span>, which are:{" "}
                <span className="font-bold px-1">{part3Data?.jobDuties || 'LIST JOB DUTIES'}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            We believe your conviction record lessens your fitness/ability to perform the job duties because:{" "}
            <span className="font-bold px-1">{part3Data?.revocationReason || 'OUTLINE REASONING FOR REVOKING JOB OFFER BASED ON RELEVANCE OF CONVICTION HISTORY TO JOB DUTIES'}</span>
          </div>

          <div className="mb-2">
            <strong><u>Your Right to File a Complaint:</u></strong>
          </div>

          <div className="mb-4">
            If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
          </div>

          <div className="ml-8 mb-4">
            <div className="mb-2"><strong>• California CRD:</strong></div>
            <div className="ml-8 mb-2">
              <div>○ File a complaint online at the following link: <span className="text-blue-600 underline">ccrs.calcivilrights.ca.gov/s/</span></div>
              <div>○ Download an intake form at the following link: <span className="text-blue-600 underline">calcivilrights.ca.gov/complaintprocess/filebymail/</span> and email it to <span className="text-blue-600 underline">contact.center@calcivilrights.gov</span> or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</div>
              <div>○ Visit a CRD office. Click the following link for office locations: <span className="text-blue-600 underline">calcivilrights.ca.gov/locations/</span></div>
              <div>○ Call California CRD at (800) 884-1684</div>
            </div>
            <div className="mb-2"><strong>• San Diego County OLSE:</strong></div>
            <div className="ml-8 mb-2">
              <div>○ File a complaint online at the following link: <span className="text-blue-600 underline">www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</span></div>
              <div>○ Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</div>
              <div>○ Call San Diego County OLSE at 619-531-5129</div>
            </div>
          </div>

          <div className="mb-4">Sincerely,</div>

          <div className="mb-2">
            <span className="font-bold px-1">{part1Data?.contactName || 'Employer contact person name'}</span>
          </div>

          <div className="mb-2">
            <span className="font-bold px-1">{part1Data?.companyName || 'Employer company name'}</span>
          </div>

          <div className="mb-2">
            <span className="font-bold px-1">{part1Data?.address || 'Employer address'}</span>
          </div>

          <div className="mb-4">
            <span className="font-bold px-1">{part1Data?.phone || 'Employer contact phone number'}</span>
          </div>

          <div className="mb-4">
            <strong>Enclosure:</strong> Copy of conviction history report
          </div>

          <div className="text-xs">
            * The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
          >
            Save for Later
          </button>
          <div className="flex gap-4 items-center">
            {!isComplete && (
              <span className="text-red-600 text-sm font-semibold mr-4">
                All fields must be filled before sending.
              </span>
            )}
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
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
            >
              Send Revocation Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal; 
