import React from "react";
import { Info } from "lucide-react";
import CriticalInfoTabs from "./CriticalInfoTabs";

interface CriticalInfoSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep: number;
}

const CriticalInfoSection: React.FC<CriticalInfoSectionProps> = ({
  activeTab,
  setActiveTab,
  currentStep,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-4">
        <Info className="h-5 w-5 mr-2" style={{ color: "#595959" }} />
        <h3
          className="text-lg font-bold text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Critical Information
        </h3>
      </div>
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {["Legal", "Company Policy", "Candidate Context"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
              activeTab === tab ? "border-b-2 border-red-600" : "hover:text-gray-800"
            }`}
            style={{
              fontFamily: "Poppins, sans-serif",
              color: activeTab === tab ? "#E54747" : "#595959",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="min-h-[200px]">
        <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default CriticalInfoSection;
