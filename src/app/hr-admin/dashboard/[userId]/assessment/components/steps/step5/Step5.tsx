import React, { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import FinalRevocationModal from "./FinalRevocationModal";
import FinalRevocationSuccessModal from "./FinalRevocationSuccessModal";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep5Storage } from "@/hooks/useStep5Storage";
import { useStep5Actions } from "@/hooks/useStep5Actions";
import { useHireActions } from "@/hooks/useHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";

const Step5: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const {
    savedHireDecision,
    setSavedHireDecision,
    setSavedFinalRevocationNotice,
  } = useAssessmentStorage(userId as string);
  const step5Storage = useStep5Storage(userId as string);
  const {
    finalRevocationForm,
    setFinalRevocationForm,
    showFinalRevocationModal,
    setShowFinalRevocationModal,
    finalRevocationPreview,
    setFinalRevocationPreview,
    handleFinalRevocationFormChange,
    handleFinalRevocationArrayChange,
  } = step5Storage;
  const { hrAdmin } = useHRAdminProfile();
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [
    showFinalRevocationSuccessModal,
    setShowFinalRevocationSuccessModal,
  ] = useState(false);
  const { proceedWithHire } = useHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });
  const { sendFinalRevocation } = useStep5Actions(
    userId as string,
    step5Storage,
    {
      hrAdminProfile: hrAdmin,
      hrAdminId: hrAdmin?.id || null,
      trackingActive: false,
      assessmentSessionId: null,
      setSavedFinalRevocationNotice,
      setShowFinalRevocationSuccessModal,
      setCurrentStep,
    },
  );
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="w-full">
          <h2 className="text-3xl font-bold mb-8 text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
            Final Compliance Step
          </h2>
          {savedHireDecision && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Decision Made: Extend Offer of Employment
                  </p>
                  <p className="text-sm text-green-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to extend the offer of employment to this candidate. The assessment process is complete.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm text-blue-900 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
                <span className="font-semibold">
                  Once you have considered any mitigating information provided by the applicant, you may still decide to revoke the conditional job offer due to relevant criminal history.
                </span>
                <br /> The following notice meets your responsibility to notify the applicant in writing.
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <button
              className={`px-12 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 w-full ${
                savedHireDecision ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => (savedHireDecision ? undefined : proceedWithHire())}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {savedHireDecision ? "✓ Extend Offer of Employment (Selected)" : "Extend Offer of Employment"}
          </button>
            <button
              className={`px-12 py-3 rounded-xl text-lg font-semibold transition-all duration-200 w-full ${
                savedHireDecision ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"
              }`}
              onClick={() => (savedHireDecision ? undefined : setShowFinalRevocationModal(true))}
              disabled={!!savedHireDecision}
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              Issue Final Revocation Notice
            </button>
          </div>
        </div>
      </div>
      <FinalRevocationModal
        show={showFinalRevocationModal}
        onClose={() => setShowFinalRevocationModal(false)}
        onPreview={() => setFinalRevocationPreview(true)}
        onSend={sendFinalRevocation}
        preview={finalRevocationPreview}
        form={finalRevocationForm}
        handleFormChange={handleFinalRevocationFormChange}
        handleArrayChange={handleFinalRevocationArrayChange}
        setPreview={setFinalRevocationPreview}
        setForm={setFinalRevocationForm}
      />
      <CriticalInfoSection activeTab={activeTab} setActiveTab={setActiveTab} currentStep={currentStep} />
      <ExtendSuccessModal
        open={showExtendSuccessModal}
        onClose={() => setShowExtendSuccessModal(false)}
        onReturn={() => {
          setShowExtendSuccessModal(false);
          window.location.assign("/hr-admin/dashboard");
        }}
      />
      <FinalRevocationSuccessModal
        open={showFinalRevocationSuccessModal}
        onClose={() => setShowFinalRevocationSuccessModal(false)}
        onReturn={() => {
          setShowFinalRevocationSuccessModal(false);
          window.location.assign("/hr-admin/dashboard");
        }}
      />
    </>
  );
};

export default Step5;
