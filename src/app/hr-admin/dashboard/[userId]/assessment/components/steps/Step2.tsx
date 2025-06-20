import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../CriticalInfoSection";
import IndividualizedAssessmentModal from "../IndividualizedAssessmentModal";

interface Step2Props {
  savedHireDecision: any;
  setShowAssessmentModal: (v: boolean) => void;
  showAssessmentModal: boolean;
  assessmentForm: any;
  handleAssessmentFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleAssessmentArrayChange: (
    field: "duties" | "activities",
    idx: number,
    value: string
  ) => void;
  assessmentPreview: boolean;
  setAssessmentPreview: (v: boolean) => void;
  handleSendAssessment: () => void;
  onAddDuty: () => void;
  onAddActivity: () => void;
  handleProceedWithHire: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep: number;
}

const Step2: React.FC<Step2Props> = ({
  savedHireDecision,
  setShowAssessmentModal,
  showAssessmentModal,
  assessmentForm,
  handleAssessmentFormChange,
  handleAssessmentArrayChange,
  assessmentPreview,
  setAssessmentPreview,
  handleSendAssessment,
  onAddDuty,
  onAddActivity,
  handleProceedWithHire,
  activeTab,
  setActiveTab,
  currentStep,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-6 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Individualized Assessment
        </h2>

        {/* Hire Decision Success Message */}
        {savedHireDecision && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-green-900 mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Decision Made: Extend Offer of Employment
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to extend the offer of employment to this candidate. The assessment process is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <p
              className="text-sm text-blue-900 leading-relaxed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              The following compliance step is to conduct an individualized assessment in writing to consider the relevance of past convictions to the job being offered.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"}`}
            onClick={() => (savedHireDecision ? undefined : setShowAssessmentModal(true))}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
          >
            Begin Individualized Assessment
          </button>
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            onClick={() => (savedHireDecision ? undefined : handleProceedWithHire())}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {savedHireDecision ? "✓ Extend Offer of Employment (Selected)" : "Extend Offer of Employment"}
          </button>
        </div>
      </div>

      {/* Critical Information Section */}
      <CriticalInfoSection activeTab={activeTab} setActiveTab={setActiveTab} currentStep={currentStep} />

      {/* Modal for Individualized Assessment */}
      <IndividualizedAssessmentModal
        showAssessmentModal={showAssessmentModal}
        setShowAssessmentModal={setShowAssessmentModal}
        assessmentForm={assessmentForm}
        handleAssessmentFormChange={handleAssessmentFormChange}
        handleAssessmentArrayChange={handleAssessmentArrayChange}
        assessmentPreview={assessmentPreview}
        setAssessmentPreview={setAssessmentPreview}
        handleSendAssessment={handleSendAssessment}
        onAddDuty={onAddDuty}
        onAddActivity={onAddActivity}
      />
    </>
  );
};

export default Step2;
