import React, { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import PreliminaryRevocationModal from "./PreliminaryRevocationModal";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep3Storage } from "@/hooks/useStep3Storage";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useStep3Actions } from "@/hooks/useStep3Actions";
import { useHireActions } from "@/hooks/useHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";

const Step3: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const { savedHireDecision, setSavedHireDecision, setSavedRevocationNotice } =
    useAssessmentStorage(userId as string);
  const step3Storage = useStep3Storage(userId as string);
  const {
    revocationForm,
    setRevocationForm,
    showRevocationModal,
    setShowRevocationModal,
    revocationPreview,
    setRevocationPreview,
    handleRevocationFormChange,
    handleRevocationArrayChange,
  } = step3Storage;
  const { hrAdmin } = useHRAdminProfile();
  const { addConviction } = useAssessmentMutators(
    (() => {}) as React.Dispatch<React.SetStateAction<any>>,
    setRevocationForm,
  );
  const [revocationSentDate, setRevocationSentDate] = useState<Date | null>(
    null,
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const { sendRevocation } = useStep3Actions(userId as string, step3Storage, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedRevocationNotice,
    setRevocationSentDate,
    setCurrentStep,
  });
  const { proceedWithHire } = useHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });

  const handleBusinessDaysSet = (days: number) => {
    localStorage.setItem("businessDaysRemaining", days.toString());
  };
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-6 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Preliminary Job Offer Revocation
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
                  Decision Made: Proceed with Hire
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Decision made on{" "}
                  {new Date(savedHireDecision.sentAt).toLocaleDateString()} to
                  proceed with hiring this candidate. The assessment process is
                  complete.
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
              The following may be used to inform a job applicant in writing of
              the intent to revoke a conditional job offer due to relevant
              criminal history
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"}`}
            onClick={() =>
              savedHireDecision ? undefined : setShowRevocationModal(true)
            }
            disabled={!!savedHireDecision}
            style={{
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#E54747",
            }}
          >
            Issue Preliminary Job Offer Revocation
          </button>
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            onClick={() => (savedHireDecision ? undefined : proceedWithHire())}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {savedHireDecision
              ? "✓ Proceed with hire (Selected)"
              : "Proceed with hire"}
          </button>
        </div>
      </div>

      {/* Critical Information Section */}
      <CriticalInfoSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStep={currentStep}
      />

      {/* Preliminary Revocation Modal */}
      <PreliminaryRevocationModal
        showRevocationModal={showRevocationModal}
        setShowRevocationModal={setShowRevocationModal}
        revocationForm={revocationForm}
        handleRevocationFormChange={handleRevocationFormChange}
        handleRevocationArrayChange={handleRevocationArrayChange}
        revocationPreview={revocationPreview}
        setRevocationPreview={setRevocationPreview}
        handleSendRevocation={sendRevocation}
        onBusinessDaysSet={handleBusinessDaysSet}
        onAddConviction={addConviction}
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

export default Step3;
