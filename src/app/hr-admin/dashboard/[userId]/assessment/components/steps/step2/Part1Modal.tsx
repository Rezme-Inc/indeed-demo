import React from "react";

interface Part1ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAssessmentArrayChange: (field: 'duties' | 'activities', idx: number, value: string) => void;
  onAddDuty: () => void;
  onNext: () => void;
}

const Part1Modal: React.FC<Part1ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  handleAssessmentArrayChange,
  onAddDuty,
  onNext,
}) => {
  if (!showModal) return null;

  const isComplete = () => {
    return assessmentForm.position &&
      assessmentForm.duties &&
      Array.isArray(assessmentForm.duties) &&
      assessmentForm.duties.filter((d: string) => d && d.trim() !== "").length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Part 1: Position & Job Duties</h2>
            <p className="text-gray-600 text-sm mt-1">Step 1 of 5</p>
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
            <label className="block text-sm font-semibold mb-2">Position Applied For</label>
            <input
              type="text"
              name="position"
              value={assessmentForm.position || ''}
              onChange={handleAssessmentFormChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter the position title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Specific duties and responsibilities of the job are:
            </label>
            {assessmentForm.duties && assessmentForm.duties.map((duty: string, idx: number) => (
              <input
                key={idx}
                type="text"
                value={duty}
                onChange={e => handleAssessmentArrayChange('duties', idx, e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder={`Duty ${String.fromCharCode(97 + idx)}`}
              />
            ))}
            <button
              type="button"
              className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              onClick={onAddDuty}
            >
              + Add Duty
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
  );
};

export default Part1Modal; 
