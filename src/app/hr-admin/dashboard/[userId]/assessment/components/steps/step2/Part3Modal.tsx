import React from "react";

interface Part3ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentArrayChange: (field: 'duties' | 'activities', idx: number, value: string) => void;
  onAddActivity: () => void;
  onNext: () => void;
  onBack: () => void;
}

const Part3Modal: React.FC<Part3ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentArrayChange,
  onAddActivity,
  onNext,
  onBack,
}) => {
  if (!showModal) return null;

  const isComplete = () => {
    return assessmentForm.activities &&
      Array.isArray(assessmentForm.activities) &&
      assessmentForm.activities.filter((a: string) => a && a.trim() !== "").length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Part 3: Activities Since Criminal Activity</h2>
            <p className="text-gray-600 text-sm mt-1">Step 3 of 5</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> At least one activity is required. Please add all relevant activities.
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Document positive changes and rehabilitation efforts made since the criminal activity occurred.
            </p>
            {assessmentForm.activities && assessmentForm.activities.map((activity: string, idx: number) => (
              <input
                key={idx}
                type="text"
                value={activity}
                onChange={e => handleAssessmentArrayChange('activities', idx, e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder={`Activity ${String.fromCharCode(97 + idx)} - e.g., Completed job training program, Volunteered at local shelter`}
              />
            ))}
            <button
              type="button"
              className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              onClick={onAddActivity}
            >
              + Add Activity
            </button>
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

export default Part3Modal;
