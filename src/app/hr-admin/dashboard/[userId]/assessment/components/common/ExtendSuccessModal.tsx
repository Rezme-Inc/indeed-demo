import React from "react";

interface ExtendSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onReturn: () => void;
}

const ExtendSuccessModal: React.FC<ExtendSuccessModalProps> = ({ open, onClose, onReturn }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-10 flex flex-col items-center relative border border-gray-200">
        <button
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="rounded-full bg-red-50 p-4 mb-4 border border-red-100">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#E54747" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
          Applicant Hired!
        </h2>
        <div className="text-lg text-center mb-8" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
          You have indicated that you intend to extend an offer of employment to the candidate. Please update your records accordingly. We will store the assessments you conducted on Rézme.
        </div>
        <button
          className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
          onClick={onReturn}
          style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ExtendSuccessModal;
