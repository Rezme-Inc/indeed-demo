import React, { useState, useEffect } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { Part1Modal, Part2Modal, Part3Modal, Part4Modal, FinalRevocationModal } from "./index";
import PreviewModal from "./PreviewModal";
import FinalRevocationSuccessModal from "./FinalRevocationSuccessModal";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep5Storage } from "@/hooks/useStep5Storage";
import { useStep5Actions } from "@/hooks/useStep5Actions";
import { useHireActions } from "@/hooks/useHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useParams } from "next/navigation";
import { useCandidateData } from "@/context/useCandidateData";

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
  const { hrAdmin } = useHRAdminProfile();
  const { candidateProfile } = useCandidateData();

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useLocalStorageState(
    `step5_current_modal_step_${userId}`,
    1
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [showFinalRevocationSuccessModal, setShowFinalRevocationSuccessModal] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);

  // Form data for each part
  const [part1Data, setPart1Data] = useLocalStorageState(`step5_part1_${userId}`, {});
  const [part2Data, setPart2Data] = useLocalStorageState(`step5_part2_${userId}`, {});
  const [part3Data, setPart3Data] = useLocalStorageState(`step5_part3_${userId}`, {});
  const [part4Data, setPart4Data] = useLocalStorageState(`step5_part4_${userId}`, {});

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

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || showFinalPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, showFinalPreview]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextStep = () => {
    if ((currentModalStep || 1) < 4) {
      setCurrentModalStep((currentModalStep || 1) + 1);
    } else {
      // Complete assessment - show final preview
      console.log("Step 5 Assessment complete!", { part1Data, part2Data, part3Data, part4Data });
      closeModal();
      setShowFinalPreview(true);
    }
  };

  const goToPreviousStep = () => {
    if ((currentModalStep || 1) > 1) {
      setCurrentModalStep((currentModalStep || 1) - 1);
    }
  };

  // Combine all part data for the final revocation form
  const getCombinedFormData = () => {
    return {
      // Part 1 - Basic Info
      date: (part1Data as any)?.date || '',
      applicant: (part1Data as any)?.applicant || '',
      dateOfNotice: (part1Data as any)?.dateOfNotice || '',

      // Part 2 - Decision Details
      noResponse: (part2Data as any)?.noResponse || false,
      infoSubmitted: (part2Data as any)?.infoSubmitted || false,
      infoSubmittedList: (part2Data as any)?.infoSubmittedList || '',
      errorOnReport: (part2Data as any)?.errorOnReport || '',
      convictions: (part2Data as any)?.convictions || [''],

      // Part 3 - Assessment Details
      seriousReason: (part3Data as any)?.seriousReason || '',
      timeSinceConduct: (part3Data as any)?.timeSinceConduct || '',
      timeSinceSentence: (part3Data as any)?.timeSinceSentence || '',
      position: (part3Data as any)?.position || '',
      jobDuties: (part3Data as any)?.jobDuties || [''],

      // Part 4 - Final Details & Contact
      fitnessReason: (part4Data as any)?.fitnessReason || '',
      reconsideration: (part4Data as any)?.reconsideration || '',
      reconsiderationProcedure: (part4Data as any)?.reconsiderationProcedure || '',
      contactName: (part4Data as any)?.contactName || '',
      companyName: (part4Data as any)?.companyName || '',
      address: (part4Data as any)?.address || '',
      phone: (part4Data as any)?.phone || '',
    };
  };

  const handleSendFinalRevocation = async () => {
    const combinedData = getCombinedFormData();

    // Update the step5Storage with combined data
    step5Storage.setFinalRevocationForm(combinedData);

    // Wait a moment for the storage to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now send the final revocation notice
    try {
      await sendFinalRevocation();
      // Close the preview modal after successful send
      setShowFinalPreview(false);
    } catch (error) {
      console.error("Error sending final revocation notice:", error);
    }
  };

  const getButtonText = () => {
    const hasProgress = (currentModalStep || 1) > 1 ||
      Object.keys(part1Data || {}).length > 0 ||
      Object.keys(part2Data || {}).length > 0 ||
      Object.keys(part3Data || {}).length > 0 ||
      Object.keys(part4Data || {}).length > 0;

    return hasProgress ? "Continue Final Revocation Notice" : "Issue Final Revocation Notice";
  };

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
              className={`px-12 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 w-full ${savedHireDecision ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              onClick={() => (savedHireDecision ? undefined : proceedWithHire())}
              disabled={!!savedHireDecision}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {savedHireDecision ? "✓ Extend Offer of Employment (Selected)" : "Extend Offer of Employment"}
            </button>
            <button
              className={`px-12 py-3 rounded-xl text-lg font-semibold transition-all duration-200 w-full ${savedHireDecision ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"
                }`}
              onClick={() => {
                if (savedHireDecision) return;
                console.log('Button clicked, current modal step:', currentModalStep);
                console.log('Current isModalOpen:', isModalOpen);
                setIsModalOpen(true); // Direct state update
                console.log('Modal should be opening now...');
              }}
              disabled={!!savedHireDecision}
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-step Final Revocation Modals */}
      <Part1Modal
        showModal={isModalOpen && currentModalStep === 1}
        setShowModal={closeModal}
        formData={part1Data}
        setFormData={setPart1Data}
        onNext={goToNextStep}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      <Part2Modal
        showModal={isModalOpen && currentModalStep === 2}
        setShowModal={closeModal}
        formData={part2Data}
        setFormData={setPart2Data}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      <Part3Modal
        showModal={isModalOpen && currentModalStep === 3}
        setShowModal={closeModal}
        formData={part3Data}
        setFormData={setPart3Data}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      <Part4Modal
        showModal={isModalOpen && currentModalStep === 4}
        setShowModal={closeModal}
        formData={part4Data}
        setFormData={setPart4Data}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      {/* Final Preview Modal */}
      <PreviewModal
        showModal={showFinalPreview}
        setShowModal={setShowFinalPreview}
        part1Data={part1Data}
        part2Data={part2Data}
        part3Data={part3Data}
        part4Data={part4Data}
        onBack={() => {
          setShowFinalPreview(false);
          setIsModalOpen(true);
          setCurrentModalStep(4);
        }}
        onSend={handleSendFinalRevocation}
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
