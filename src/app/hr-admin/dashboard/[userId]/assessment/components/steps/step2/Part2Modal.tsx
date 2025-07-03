import React from "react";

interface Part2ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Part2Modal: React.FC<Part2ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  onNext,
  onBack,
}) => {
  if (!showModal) return null;

  const isComplete = () => {
    return assessmentForm.reportDate &&
      assessmentForm.howLongAgo &&
      assessmentForm.conduct;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 2: Criminal History Details</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 2 of 5</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Please complete all information before proceeding.
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Date of Criminal History Report <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="reportDate"
              value={assessmentForm.reportDate || ''}
              onChange={handleAssessmentFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How long ago did the criminal activity occur: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="howLongAgo"
              value={assessmentForm.howLongAgo || ''}
              onChange={handleAssessmentFormChange}
              placeholder="e.g., 5 years ago, 2 months ago"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Description of the criminal conduct and why the conduct is of concern with respect to the position in question <span className="text-red-500">*</span>
            </label>
            <textarea
              name="conduct"
              value={assessmentForm.conduct || ''}
              onChange={handleAssessmentFormChange}
              placeholder="Provide detailed description of the criminal conduct and explain why it's concerning for this specific position..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              required
            />
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Save for Later
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
              style={{ fontFamily: 'Poppins, sans-serif' }}
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
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Part2Modal;
