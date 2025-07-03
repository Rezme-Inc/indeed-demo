import React from 'react';

interface Part3ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const Part3Modal: React.FC<Part3ModalProps> = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  onNext,
  onBack,
  candidateProfile,
  hrAdmin,
  candidateId,
}) => {

  if (!showModal) return null;

  const isComplete = () => {
    return formData.fitnessReason && formData.fitnessReason.trim() !== '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 3: Final Decision Reasoning</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 3 of 4</p>
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:
              </label>
              <textarea
                value={formData.fitnessReason || ''}
                onChange={(e) => setFormData({ ...formData, fitnessReason: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Outline reasoning for decision to revoke job offer based on relevance of conviction history to position"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                required
              />
            </div>
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={onBack}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={() => setShowModal(false)}
              style={{ fontFamily: 'Poppins, sans-serif' }}
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

export default Part3Modal; 
