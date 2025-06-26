import React from "react";

interface Part5ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Part5Modal: React.FC<Part5ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  onNext,
  onBack,
}) => {
  if (!showModal) return null;

  const isComplete = () => {
    return assessmentForm.employer &&
      assessmentForm.applicant &&
      assessmentForm.offerDate &&
      assessmentForm.assessmentDate &&
      assessmentForm.performedBy;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Part 5: Assessment Details</h2>
            <p className="text-gray-600 text-sm mt-1">Step 5 of 5</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required to complete the assessment.
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Employer Name</label>
              <input
                type="text"
                name="employer"
                value={assessmentForm.employer || ''}
                onChange={handleAssessmentFormChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter employer/company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Applicant Name</label>
              <input
                type="text"
                name="applicant"
                value={assessmentForm.applicant || ''}
                onChange={handleAssessmentFormChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter applicant's full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Date of Conditional Offer</label>
              <input
                type="date"
                name="offerDate"
                value={assessmentForm.offerDate || ''}
                onChange={handleAssessmentFormChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date of Assessment</label>
              <input
                type="date"
                name="assessmentDate"
                value={assessmentForm.assessmentDate || ''}
                onChange={handleAssessmentFormChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Assessment Performed by</label>
            <input
              type="text"
              name="performedBy"
              value={assessmentForm.performedBy || ''}
              onChange={handleAssessmentFormChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter name of person performing assessment"
            />
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
          >
            Save for Later
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
            >
              Back
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded font-semibold ${isComplete()
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              onClick={onNext}
              disabled={!isComplete()}
            >
              Review & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Part5Modal; 
