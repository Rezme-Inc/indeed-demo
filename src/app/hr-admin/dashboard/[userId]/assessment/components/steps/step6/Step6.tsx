import React, { useState } from "react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";

interface Step6Props {
  onViewCandidateResponse: () => void;
  currentStep: number;
}

const Step6: React.FC<Step6Props> = ({
  onViewCandidateResponse,
  currentStep,
}) => {
  const [activeTab, setActiveTab] = useState("Legal");

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="w-full text-center">
          <div className="rounded-full bg-green-50 p-6 mb-6 mx-auto w-fit border border-green-100">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              style={{ color: "#10B981" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Assessment Complete
          </h2>
          <p
            className="text-lg mb-8"
            style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
          >
            All assessment steps have been completed successfully. The fair chance hiring process is now complete for this candidate.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              onClick={() => (window.location.href = "/hr-admin/dashboard")}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Return to Dashboard
            </button>
            <button
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
              onClick={onViewCandidateResponse}
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              View Final Records
            </button>
          </div>
        </div>
      </div>
      <CriticalInfoSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStep={currentStep}
      />
    </>
  );
};

export default Step6;
