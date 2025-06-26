import React, { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import IndividualizedAssessmentModal from "./IndividualizedAssessmentModal";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep2Storage } from "@/hooks/useStep2Storage";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useStep2Actions } from "@/hooks/useStep2Actions";
import { useHireActions } from "@/hooks/useHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";

const Step2: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const {
    savedHireDecision,
    setSavedHireDecision,
    setSavedAssessment,
  } = useAssessmentStorage(userId as string);
  const step2Storage = useStep2Storage(userId as string);
  const {
    assessmentForm,
    setAssessmentForm,
    showAssessmentModal,
    setShowAssessmentModal,
    assessmentPreview,
    setAssessmentPreview,
    handleAssessmentFormChange,
    handleAssessmentArrayChange,
  } = step2Storage;
  const { hrAdmin } = useHRAdminProfile();
  const { addDuty, addActivity } = useAssessmentMutators(
    setAssessmentForm,
    (() => {}) as React.Dispatch<React.SetStateAction<any>>
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [initialAssessmentResults, setInitialAssessmentResults] =
    useState<any>(null);
  const { sendAssessment } = useStep2Actions(
    userId as string,
    step2Storage,
    {
      hrAdminProfile: hrAdmin,
      hrAdminId: hrAdmin?.id || null,
      trackingActive: false,
      assessmentSessionId: null,
      setSavedAssessment,
      setInitialAssessmentResults,
      setCurrentStep,
    }
  );
  const { proceedWithHire } = useHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });
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
            onClick={() => (savedHireDecision ? undefined : proceedWithHire())}
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
        handleSendAssessment={sendAssessment}
        onAddDuty={addDuty}
        onAddActivity={addActivity}
      />
      <ExtendSuccessModal
        open={showExtendSuccessModal}
        onClose={() => setShowExtendSuccessModal(false)}
        onReturn={() => {
          setShowExtendSuccessModal(false);
          window.location.assign("/hr-admin/dashboard");
        }}
      />
    </>
  );
};

export default Step2;
