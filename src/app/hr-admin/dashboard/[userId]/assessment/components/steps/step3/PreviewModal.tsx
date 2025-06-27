import React from "react";

interface PreviewModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  part1Data: any;
  part2Data: any;
  part3Data: any;
  candidateProfile: any;
  hrAdmin: any;
  step1Storage: any;
  onBack: () => void;
  onSend: () => void;
}

function isStep3Complete(part1Data: any, part2Data: any, part3Data: any) {
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

  return true;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  showModal,
  setShowModal,
  part1Data,
  part2Data,
  part3Data,
  candidateProfile,
  hrAdmin,
  step1Storage,
  onBack,
  onSend,
}) => {
  if (!showModal) return null;

  const isComplete = isStep3Complete(part1Data, part2Data, part3Data);

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

        <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
          <h3 className="font-bold mb-4 text-xl">Notice of Preliminary Decision to Revoke Job Offer</h3>

          <h4 className="font-bold mb-2">BASIC INFORMATION</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><b>Date:</b> {part1Data?.date || 'Not specified'}</div>
            <div><b>Applicant Name:</b> {part1Data?.applicantName || 'Not specified'}</div>
            <div><b>Position:</b> {part1Data?.position || 'Not specified'}</div>
            <div><b>Contact Name:</b> {part1Data?.contactName || 'Not specified'}</div>
            <div><b>Company Name:</b> {part1Data?.companyName || 'Not specified'}</div>
            <div><b>Phone:</b> {part1Data?.phone || 'Not specified'}</div>
            <div className="col-span-2"><b>Address:</b> {part1Data?.address || 'Not specified'}</div>
          </div>

          <h4 className="font-bold mt-6 mb-2">CONVICTION DETAILS</h4>
          <div className="mb-4">
            <b>Convictions that led to decision to revoke offer:</b>
            <ul className="list-disc ml-6 mt-2">
              {part2Data?.convictions && part2Data.convictions.map((conviction: string, idx: number) =>
                conviction && conviction.trim() !== "" && <li key={idx}>{conviction}</li>
              )}
            </ul>
          </div>
          <div className="mb-4">
            <b>How long ago did the conduct occur:</b> {part2Data?.conductTimeAgo || 'Not specified'}
          </div>
          <div className="mb-4">
            <b>How long ago was the sentence completed:</b> {part2Data?.sentenceCompletedTimeAgo || 'Not specified'}
          </div>

          <h4 className="font-bold mt-6 mb-2">ASSESSMENT & REASONING</h4>
          <div className="mb-4">
            <b>Job duties:</b>
            <p className="mt-2 pl-4 border-l-2 border-gray-300">{part3Data?.jobDuties || 'Not specified'}</p>
          </div>
          <div className="mb-4">
            <b>Why the conduct was considered serious:</b>
            <p className="mt-2 pl-4 border-l-2 border-gray-300">{part3Data?.seriousnessReason || 'Not specified'}</p>
          </div>
          <div className="mb-4">
            <b>Reason for revoking job offer based on relevance of conviction history:</b>
            <p className="mt-2 pl-4 border-l-2 border-gray-300">{part3Data?.revocationReason || 'Not specified'}</p>
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
