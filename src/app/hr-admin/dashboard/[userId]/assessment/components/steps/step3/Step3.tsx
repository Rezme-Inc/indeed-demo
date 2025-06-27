import React, { useState, useEffect } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { Part1Modal, Part2Modal, Part3Modal } from "./index";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep3Storage } from "@/hooks/useStep3Storage";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useStep3Actions } from "@/hooks/useStep3Actions";
import { useHireActions } from "@/hooks/useHireActions";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";
import { useCandidateData } from "@/context/useCandidateData";
import { useAssessmentStorageContext } from "@/context/AssessmentStorageProvider";

const Step3: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const { savedHireDecision, setSavedHireDecision } = useAssessmentStorage(userId as string);
  const { hrAdmin } = useHRAdminProfile();
  const { candidateProfile } = useCandidateData();
  const { step1Storage, step2Storage } = useAssessmentStorageContext();

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useLocalStorageState(
    `step3_current_modal_step_${userId}`,
    1
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);

  // Form data for each part
  const [part1Data, setPart1Data] = useLocalStorageState(`step3_part1_${userId}`, {});
  const [part2Data, setPart2Data] = useLocalStorageState(`step3_part2_${userId}`, {});
  const [part3Data, setPart3Data] = useLocalStorageState(`step3_part3_${userId}`, {});



  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextStep = () => {
    if ((currentModalStep || 1) < 3) {
      setCurrentModalStep((currentModalStep || 1) + 1);
    } else {
      // Complete assessment - send revocation notice
      console.log("Step 3 Assessment complete!", { part1Data, part2Data, part3Data });
      closeModal();
      // Mock sending revocation notice
      setShowExtendSuccessModal(true);
    }
  };

  const goToPreviousStep = () => {
    if ((currentModalStep || 1) > 1) {
      setCurrentModalStep((currentModalStep || 1) - 1);
    }
  };

  const proceedWithHire = () => {
    // Mock hire decision
    setSavedHireDecision({
      decision: 'hire',
      sentAt: new Date().toISOString(),
      hrAdminId: hrAdmin?.id || null
    });
    setShowExtendSuccessModal(true);
  };

  const getButtonText = () => {
    const hasProgress = (currentModalStep || 1) > 1 ||
      Object.keys(part1Data || {}).length > 0 ||
      Object.keys(part2Data || {}).length > 0 ||
      Object.keys(part3Data || {}).length > 0;

    return hasProgress ? "Continue Assessment" : "Issue Preliminary Job Offer Revocation";
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
            onClick={() => savedHireDecision ? undefined : openModal()}
            disabled={!!savedHireDecision}
            style={{
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#E54747",
            }}
          >
            {getButtonText()}
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

      {/* Part 1 Modal */}
      <Part1Modal
        showModal={isModalOpen && (currentModalStep || 1) === 1}
        setShowModal={closeModal}
        formData={part1Data || {}}
        updateFormData={(updates) => setPart1Data({ ...(part1Data || {}), ...updates })}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        step1Storage={step1Storage}
        step2Storage={step2Storage}
        onNext={goToNextStep}
        candidateId={userId}
      />

      {/* Part 2 Modal */}
      <Part2Modal
        showModal={isModalOpen && (currentModalStep || 1) === 2}
        setShowModal={closeModal}
        formData={part2Data || {}}
        updateFormData={(updates) => setPart2Data({ ...(part2Data || {}), ...updates })}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        step1Storage={step1Storage}
        step2Storage={step2Storage}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateId={userId}
      />

      {/* Part 3 Modal */}
      <Part3Modal
        showModal={isModalOpen && (currentModalStep || 1) === 3}
        setShowModal={closeModal}
        formData={part3Data || {}}
        updateFormData={(updates) => setPart3Data({ ...(part3Data || {}), ...updates })}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        step1Storage={step1Storage}
        step2Storage={step2Storage}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateId={userId}
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
