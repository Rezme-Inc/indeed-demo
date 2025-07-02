import React from "react";

interface PreviewModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  onBack: () => void;
  onSend: () => void;
}

function isAssessmentFormComplete(assessmentForm: any) {
  // Check all string fields
  const requiredFields = [
    'employer', 'applicant', 'position', 'offerDate', 'assessmentDate', 'reportDate', 'performedBy', 'conduct', 'howLongAgo', 'rescindReason'
  ];
  for (const field of requiredFields) {
    if (!assessmentForm[field] || assessmentForm[field].toString().trim() === "") return false;
  }
  // Duties: at least one non-empty
  if (!assessmentForm.duties || !Array.isArray(assessmentForm.duties) || assessmentForm.duties.filter((d: string) => d && d.trim() !== "").length === 0) return false;
  // Activities: at least one non-empty
  if (!assessmentForm.activities || !Array.isArray(assessmentForm.activities) || assessmentForm.activities.filter((a: string) => a && a.trim() !== "").length === 0) return false;
  return true;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  onBack,
  onSend,
}) => {
  if (!showModal) return null;

  const isComplete = isAssessmentFormComplete(assessmentForm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Review Assessment</h2>
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
          <h3 className="font-bold mb-4 text-xl">Criminal History Individual Assessment Form</h3>

          <h4 className="font-bold mb-2">INFORMATION</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><b>Employer Name:</b> {assessmentForm.employer}</div>
            <div><b>Applicant Name:</b> {assessmentForm.applicant}</div>
            <div><b>Position Applied For:</b> {assessmentForm.position}</div>
            <div><b>Date of Conditional Offer:</b> {assessmentForm.offerDate}</div>
            <div><b>Date of Assessment:</b> {assessmentForm.assessmentDate}</div>
            <div><b>Date of Criminal History Report:</b> {assessmentForm.reportDate}</div>
            <div className="col-span-2"><b>Assessment Performed by:</b> {assessmentForm.performedBy}</div>
          </div>

          <h4 className="font-bold mt-6 mb-2">ASSESSMENT</h4>

          <div className="mb-4">
            <b>1. The specific duties and responsibilities of the job are:</b>
            <ul className="list-disc ml-6 mt-2">
              {assessmentForm.duties && assessmentForm.duties.map((duty: string, idx: number) =>
                duty && <li key={idx}>{duty}</li>
              )}
            </ul>
          </div>

          <div className="mb-4">
            <b>2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question:</b>
            <p className="mt-2 pl-4 border-l-2 border-gray-300">{assessmentForm.conduct}</p>
          </div>

          <div className="mb-4">
            <b>3. How long ago did the criminal activity occur:</b> {assessmentForm.howLongAgo}
          </div>

          <div className="mb-4">
            <b>4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</b>
            <ul className="list-disc ml-6 mt-2">
              {assessmentForm.activities && assessmentForm.activities.map((act: string, idx: number) =>
                act && <li key={idx}>{act}</li>
              )}
            </ul>
          </div>

          <div className="mb-4">
            <b>Based on the factors above, we are considering rescinding our offer of employment because:</b>
            <p className="mt-2 pl-4 border-l-2 border-gray-300">{assessmentForm.rescindReason}</p>
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
              Send Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
