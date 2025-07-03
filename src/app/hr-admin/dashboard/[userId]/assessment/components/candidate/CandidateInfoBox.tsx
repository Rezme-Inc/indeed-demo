import React from "react";
import { User } from "lucide-react";

interface CandidateInfoBoxProps {
  onViewCandidateResponse: () => void;
}

const CandidateInfoBox: React.FC<CandidateInfoBoxProps> = ({ onViewCandidateResponse }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center">
          <User className="h-6 w-6" style={{ color: "#595959" }} />
        </div>
        <div>
          <h3
            className="text-sm font-bold text-black mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Candidate Information
          </h3>
          <button
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs transition-all duration-200 hover:bg-gray-50"
            style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
            onClick={onViewCandidateResponse}
          >
            View Candidate Response
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateInfoBox;
