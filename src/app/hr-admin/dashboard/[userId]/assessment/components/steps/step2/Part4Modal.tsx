import React from "react";

interface Part4ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Part4Modal: React.FC<Part4ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  onNext,
  onBack,
}) => {
  if (!showModal) return null;

  const isComplete = () => {
    return assessmentForm.rescindReason && assessmentForm.rescindReason.trim() !== "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Part 4: Rescission Reasoning</h2>
            <p className="text-gray-600 text-sm mt-1">Step 4 of 5</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> This field is required. Please provide detailed reasoning for the rescission consideration.
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Based on the factors above, we are considering rescinding our offer of employment because:
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Describe the link between the specific aspects of the applicant's criminal history with risks inherent in the duties of the employment position. Be specific and objective in your assessment.
            </p>
            <textarea
              name="rescindReason"
              value={assessmentForm.rescindReason || ''}
              onChange={handleAssessmentFormChange}
              className="w-full border rounded px-3 py-2 min-h-[150px]"
              placeholder="Provide a detailed explanation of how the criminal history directly relates to the job duties and creates specific risks for this position. Include references to the job duties and criminal conduct described in previous sections..."
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Part4Modal; 
