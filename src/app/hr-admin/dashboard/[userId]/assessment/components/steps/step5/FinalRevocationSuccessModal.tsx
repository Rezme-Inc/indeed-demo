import React from "react";

interface FinalRevocationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onReturn: () => void;
}

const FinalRevocationSuccessModal: React.FC<FinalRevocationSuccessModalProps> = ({ open, onClose, onReturn }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-6xl w-full flex flex-col items-center relative border border-gray-200">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="rounded-full bg-red-50 p-6 mb-6 border border-red-100">
          <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#E54747" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-center mb-4 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
          Final Revocation Notice Sent
        </h1>
        <p className="text-lg text-center mb-8 max-w-4xl" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
          You have indicated that you will not be proceeding with an offer of employment to the candidate. Please update your records accordingly. We will store the assessments and actions you conducted on Rézme including the steps you took to ensure compliance with San Diego County Fair Chance Ordinance and The Office of Labor Standards and Enforcement (OLSE).
        </p>
        <button
          className="px-8 py-4 rounded-xl text-lg font-semibold text-white hover:opacity-90 mb-8 transition-all duration-200"
          onClick={onReturn}
          style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
        >
          Return to Dashboard
        </button>
        <div className="w-full border-t border-gray-200 pt-8 flex flex-col items-center">
          <div className="flex flex-row items-center gap-8 text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#595959" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              OLSE@sdcounty.ca.gov
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#595959" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href="https://www.sandiegocounty.gov/OLSE.html" className="underline hover:no-underline transition-all duration-200">
                https://www.sandiegocounty.gov/OLSE.html
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#595959" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              619-531-5129
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalRevocationSuccessModal;
