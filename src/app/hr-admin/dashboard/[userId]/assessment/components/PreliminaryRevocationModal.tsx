import React, { useRef } from "react";

interface PreliminaryRevocationModalProps {
  showRevocationModal: boolean;
  setShowRevocationModal: (show: boolean) => void;
  revocationForm: any;
  handleRevocationFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRevocationArrayChange: (idx: number, value: string) => void;
  revocationPreview: boolean;
  setRevocationPreview: (show: boolean) => void;
  handleSendRevocation: () => void;
  onBusinessDaysSet?: (days: number) => void;
  onAddConviction: () => void;
}

function isRevocationFormComplete(revocationForm: any) {
  const requiredFields = [
    'date', 'applicant', 'position', 'numBusinessDays', 'contactName', 'company', 'address', 'phone', 'seriousReason', 'timeSinceConduct', 'timeSinceSentence', 'jobDuties', 'fitnessReason'
  ];
  for (const field of requiredFields) {
    if (!revocationForm[field] || revocationForm[field].toString().trim() === "") return false;
  }
  // At least one conviction
  if (!revocationForm.convictions || !Array.isArray(revocationForm.convictions) || revocationForm.convictions.filter((c: string) => c && c.trim() !== "").length === 0) return false;
  // numBusinessDays must be at least 5
  if (Number(revocationForm.numBusinessDays) < 5) return false;
  return true;
}

const PreliminaryRevocationModal: React.FC<PreliminaryRevocationModalProps> = ({
  showRevocationModal,
  setShowRevocationModal,
  revocationForm,
  handleRevocationFormChange,
  handleRevocationArrayChange,
  revocationPreview,
  setRevocationPreview,
  handleSendRevocation,
  onBusinessDaysSet,
  onAddConviction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSendRevocationWithDays = () => {
    if (onBusinessDaysSet) {
      onBusinessDaysSet(Number(revocationForm.numBusinessDays));
    }
    handleSendRevocation();
  };

  if (!showRevocationModal) return null;
  const isComplete = isRevocationFormComplete(revocationForm);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History</h2>
        {/* Compliance Notice */}
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Failure to complete all fields may result in legal incompliance.
        </div>
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold mr-2"
            onClick={() => setRevocationPreview(!revocationPreview)}
          >
            {revocationPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold"
            onClick={() => setShowRevocationModal(false)}
          >
            Cancel
          </button>
        </div>
        {!revocationPreview ? (
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input type="date" name="date" value={revocationForm.date} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                <input type="text" name="applicant" value={revocationForm.applicant} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Position</label>
                <input type="text" name="position" value={revocationForm.position} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Convictions that led to decision to revoke offer</label>
              {revocationForm.convictions.map((conv: string, idx: number) => (
                <input
                  key={idx}
                  type="text"
                  value={conv}
                  onChange={e => handleRevocationArrayChange(idx, e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder={`Conviction ${idx + 1}`}
                />
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                onClick={onAddConviction}
              >
                + Add Conviction
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Number of business days to respond (must be at least 5)</label>
              <input
                type="number"
                name="numBusinessDays"
                value={revocationForm.numBusinessDays}
                onChange={handleRevocationFormChange}
                className={`w-full border rounded px-3 py-2 ${Number(revocationForm.numBusinessDays) < 5 ? "border-red-500" : ""}`}
                min={5}
              />
              {Number(revocationForm.numBusinessDays) < 5 && (
                <p className="text-red-500 text-sm mt-1">Number of business days must be at least 5.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Contact Name</label>
              <input type="text" name="contactName" value={revocationForm.contactName} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Company Name</label>
              <input type="text" name="company" value={revocationForm.company} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Address</label>
              <input type="text" name="address" value={revocationForm.address} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input type="text" name="phone" value={revocationForm.phone} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Describe why the conduct was considered serious</label>
              <textarea name="seriousReason" value={revocationForm.seriousReason} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">How long ago the conduct occurred</label>
              <input type="text" name="timeSinceConduct" value={revocationForm.timeSinceConduct} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">How long ago sentence was completed</label>
              <input type="text" name="timeSinceSentence" value={revocationForm.timeSinceSentence} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Job Duties</label>
              <textarea name="jobDuties" value={revocationForm.jobDuties} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Reason for revoking job offer based on relevance of conviction history to job duties</label>
              <textarea name="fitnessReason" value={revocationForm.fitnessReason} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
            </div>
            <div className="flex justify-end mt-8 gap-4 items-center">
              <button
                type="button"
                className={`px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600`}
                onClick={() => {
                  setRevocationPreview(!revocationPreview);
                  scrollToTop();
                }}
              >
                Preview
              </button>
            </div>
          </form>
        ) : (
          <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
            <div className="mb-2">{revocationForm.date}</div>
            <div className="mb-2">Re: Preliminary Decision to Revoke Job Offer Because of Conviction History</div>
            <div className="mb-2">Dear {revocationForm.applicant}:</div>
            <div className="mb-2">After reviewing the results of your conviction history background check, we have made a preliminary (non-final) decision to revoke (take back) our previous job offer for the position of {revocationForm.position} because of the following conviction(s):
              <ul className="list-disc ml-6">
                {revocationForm.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
              </ul>
              A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.
            </div>
            <div className="mb-2">As prohibited by Local and California law, we have NOT considered any of the following:
              <ul className="list-disc ml-6">
                <li>Arrest(s) not followed by conviction;</li>
                <li>Participation in a pretrial or posttrial diversion program; or</li>
                <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
              </ul>
            </div>
            <div className="mb-2"><b>Your Right to Respond:</b><br />
              The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final. Within {revocationForm.numBusinessDays} business days* from when you first receive this notice, you may send us:
              <ul className="list-disc ml-6">
                <li>Evidence of rehabilitation or mitigating circumstances</li>
                <li>Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.</li>
              </ul>
              Please send any additional information you would like us to consider to: {revocationForm.contactName}, {revocationForm.company}, {revocationForm.address}, {revocationForm.phone}
            </div>
            <div className="mb-2"><b>Here are some examples of information you may send us:</b>
              <ul className="list-disc ml-6">
                <li>Evidence that you were not convicted of one or more of the offenses we listed above or that the conviction record is inaccurate (such as the number of convictions listed);</li>
                <li>Facts or circumstances surrounding the offense or conduct, showing that the conduct was less serious than the conviction seems;</li>
                <li>The time that has passed since the conduct that led to your conviction(s) or since your release from incarceration;</li>
                <li>The length and consistency of employment history or community involvement (such as volunteer activities) before and after the offense(s);</li>
                <li>Employment or character references from people who know you, such as letters from teachers, counselors, supervisors, clergy, and probation or parole officers;</li>
                <li>Evidence that you attended school, job training, or counseling;</li>
                <li>Evidence that you have performed the same type of work since your conviction;</li>
                <li>Whether you are bonded under a federal, state, or local bonding program; and</li>
                <li>Any other evidence of your rehabilitation efforts, such as (i) evidence showing how much time has passed since release from incarceration without subsequent conviction, (ii) evidence showing your compliance with the terms and conditions of probation or parole, or (iii) evidence showing your present fitness for the job.</li>
              </ul>
            </div>
            <div className="mb-2">We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. We will notify you in writing if we make a final decision to revoke the job offer.</div>
            <div className="mb-2"><b>Our Individualized Assessment:</b><br />
              We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
              <ol className="list-decimal ml-6">
                <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {revocationForm.seriousReason}</li>
                <li>How long ago the conduct occurred that led to your conviction, which was: {revocationForm.timeSinceConduct} and how long ago you completed your sentence, which was: {revocationForm.timeSinceSentence}.</li>
                <li>The specific duties and responsibilities of the position of {revocationForm.position}, which are: {revocationForm.jobDuties}</li>
              </ol>
              We believe your conviction record lessens your fitness/ability to perform the job duties because: {revocationForm.fitnessReason}
            </div>
            <div className="mb-2"><b>Your Right to File a Complaint:</b><br />
              If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
              <ul className="list-disc ml-6">
                <li>California CRD:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: ccrs.calcivilrights.ca.gov/s/</li>
                    <li>Download an intake form at the following link: calcivilrights.ca.gov/complaintprocess/filebymail/ and email it to contact.center@calcivilrights.gov or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
                    <li>Visit a CRD office. Click the following link for office locations: calcivilrights.ca.gov/locations/</li>
                    <li>Call California CRD at (800) 884-1684</li>
                  </ul>
                </li>
                <li>San Diego County OLSE:
                  <ul className="list-disc ml-6">
                    <li>File a complaint online at the following link: www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</li>
                    <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
                    <li>Call San Diego County OLSE at 619-531-5129</li>
                  </ul>
                </li>
              </ul>
            </div>
            <div className="mb-2">Sincerely,<br />{revocationForm.contactName}<br />{revocationForm.company}<br />{revocationForm.address}<br />{revocationForm.phone}</div>
            <div className="mb-2">Enclosure: Copy of conviction history report</div>
            <div className="mb-2 text-xs">* The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information</div>
            <div className="flex justify-end mt-8 items-center gap-4">
              {!isComplete && (
                <span className="text-red-600 text-sm font-semibold mr-4">All fields must be filled before sending.</span>
              )}
              <button
                type="button"
                className={`px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600${!isComplete ? ' opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSendRevocationWithDays}
                disabled={!isComplete}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreliminaryRevocationModal; 
