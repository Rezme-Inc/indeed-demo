import React from "react";
import { Scale } from "lucide-react";
import { useRouter } from "next/navigation";

interface FairChanceOverviewBoxProps {
  candidateId: string;
}

const FairChanceOverviewBox: React.FC<FairChanceOverviewBoxProps> = ({ candidateId }) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center">
          <Scale className="h-6 w-6" style={{ color: "#E54747" }} />
        </div>
        <div>
          <h3
            className="text-sm font-bold text-black mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            San Diego Fair Chance Ordinance Legal Overview
          </h3>
          <button
            className="px-3 py-2 border border-gray-300 rounded-xl text-xs transition-all duration-200 hover:bg-gray-50"
            style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
            onClick={() =>
              router.push(`/hr-admin/dashboard/${candidateId}/assessment/ordinance-summary`)
            }
          >
            View Ordinance Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default FairChanceOverviewBox;
