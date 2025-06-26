import React from "react";
import { FileText } from "lucide-react";

interface CandidateResponseModalProps {
  open: boolean;
  onClose: () => void;
  candidateShareToken: string | null;
  candidateProfile: any;
  loading: boolean;
}

const CandidateResponseModal: React.FC<CandidateResponseModalProps> = ({
  open,
  onClose,
  candidateShareToken,
  candidateProfile,
  loading,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full p-8 relative max-h-screen overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Candidate Response - Restorative Record
            {candidateProfile && ` - ${candidateProfile.first_name} ${candidateProfile.last_name}`}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#E54747" }}></div>
            <p className="text-gray-600" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
              Loading candidate's restorative record...
            </p>
          </div>
        ) : candidateShareToken ? (
          /* Iframe Content */
          <div className="h-[70vh]">
            <iframe
              src={`${window.location.origin}/restorative-record/share/${candidateShareToken}`}
              title="Candidate Restorative Record"
              className="w-full h-full rounded-xl border border-gray-200"
              frameBorder="0"
            />
          </div>
        ) : candidateProfile ? (
          /* Private Profile State */
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Profile is Private
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
              {candidateProfile.first_name} {candidateProfile.last_name} has chosen to keep their restorative record private. The candidate would need to enable sharing to make their record accessible.
            </p>
            <button
              className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 mb-6"
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              Request Restorative Record
            </button>
            <div className="bg-red-50 rounded-xl p-6 max-w-md mx-auto border border-red-100">
              <h4 className="font-semibold mb-3 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                How to Enable Sharing:
              </h4>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                The candidate can enable sharing by visiting their restorative record profile page and clicking the "Share" button to generate a shareable link.
              </p>
            </div>
          </div>
        ) : (
          /* No Data State */
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              No Restorative Record Available
            </h3>
            <p className="text-gray-600">
              This candidate has not yet created a restorative record or it may not be available for sharing.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            onClick={onClose}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateResponseModal;
