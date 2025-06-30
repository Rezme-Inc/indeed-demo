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
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";
import { getStep5Suggestions } from "@/utils/assessmentDataAggregator";

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

  // Database integration state
  const [isStep5CompletedFromDB, setIsStep5CompletedFromDB] = useState(false);

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

  // Load assessment data from database when component mounts
  useEffect(() => {
    const loadAssessmentData = async () => {
      try {
        console.log('[Step5] Loading assessment data from database...');

        // Check if Step 5 is completed and load data from database
        const assessmentExists = await AssessmentDatabaseService.assessmentExists(userId);
        if (assessmentExists) {
          const currentStep = await AssessmentDatabaseService.getCurrentStep(userId);
          if (currentStep > 5) {
            console.log("[Step5] Step 5 is completed, loading from database...");
            const step5Data = await AssessmentDatabaseService.getStepData(userId, 5);
            if (step5Data) {
              console.log("[Step5] Step 5 data loaded from database:", step5Data);
              setIsStep5CompletedFromDB(true);

              // Load the final revocation form data from database
              step5Storage.setFinalRevocationForm(step5Data as any);
            }
          }
        }

      } catch (error) {
        console.error('[Step5] Error loading assessment data:', error);
      }
    };

    loadAssessmentData();
  }, [userId]);

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
      closeModal();
      setShowFinalPreview(true);
    }
  };

  const goToPreviousStep = () => {
    if ((currentModalStep || 1) > 1) {
      setCurrentModalStep((currentModalStep || 1) - 1);
    }
  };

  // Combine all part data for the final revocation form with autofill fallback
  const getCombinedFormData = async () => {
    // Get autofill suggestions as fallback for empty form data
    let autofillData = {};
    if (candidateProfile && hrAdmin) {
      try {
        autofillData = await getStep5Suggestions(userId, candidateProfile, hrAdmin);
        console.log('[Step5] Autofill fallback data:', autofillData);
      } catch (error) {
        console.error('[Step5] Error getting autofill fallback:', error);
      }
    }

    // Get current date as fallback
    const today = new Date().toISOString().split('T')[0];

    // Helper function to get non-empty value with fallback
    const getValueWithFallback = (partValue: any, autofillValue: any, defaultValue: any = '') => {
      if (partValue && partValue !== '' && partValue !== null && partValue !== undefined) {
        return partValue;
      }
      if (autofillValue && autofillValue !== '' && autofillValue !== null && autofillValue !== undefined) {
        return autofillValue;
      }
      return defaultValue;
    };

    // Helper for arrays
    const getArrayWithFallback = (partArray: any, autofillArray: any, defaultArray: any = []) => {
      if (partArray && Array.isArray(partArray) && partArray.length > 0 && partArray.some((item: any) => item && item !== '')) {
        return partArray;
      }
      if (autofillArray && Array.isArray(autofillArray) && autofillArray.length > 0) {
        return autofillArray;
      }
      return defaultArray;
    };

    const combinedData = {
      // Basic Info (from Part 4 modal) with autofill fallback
      date: getValueWithFallback((part4Data as any)?.currentDate, (autofillData as any)?.date, today),
      applicant: getValueWithFallback((part4Data as any)?.applicant, (autofillData as any)?.applicant, ''),
      dateOfNotice: getValueWithFallback((part4Data as any)?.dateOfNotice, (autofillData as any)?.dateOfNotice, today),

      // Decision Details (from Part 1 modal) - mostly manual input, keep defaults
      noResponse: (part1Data as any)?.noResponse || (autofillData as any)?.noResponse || false,
      infoSubmitted: (part1Data as any)?.infoSubmitted || (autofillData as any)?.infoSubmitted || false,
      infoSubmittedList: getValueWithFallback((part1Data as any)?.infoSubmittedList, (autofillData as any)?.infoSubmittedList, ''),
      errorOnReport: getValueWithFallback((part1Data as any)?.errorOnReport, (autofillData as any)?.errorOnReport, ''),
      convictions: getArrayWithFallback((part1Data as any)?.convictions, (autofillData as any)?.convictions, []),

      // Assessment Details (from Part 2 modal) with autofill fallback from previous steps
      seriousReason: getValueWithFallback((part2Data as any)?.seriousReason, (autofillData as any)?.seriousReason, ''),
      timeSinceConduct: getValueWithFallback((part2Data as any)?.timeSinceConduct, (autofillData as any)?.timeSinceConduct, ''),
      timeSinceSentence: getValueWithFallback((part2Data as any)?.timeSinceSentence, (autofillData as any)?.timeSinceSentence, ''),
      position: getValueWithFallback((part2Data as any)?.position, (autofillData as any)?.position, ''),
      jobDuties: getArrayWithFallback((part2Data as any)?.jobDuties, (autofillData as any)?.jobDuties, []),

      // Final Decision Reasoning (from Part 3 modal)
      fitnessReason: getValueWithFallback((part3Data as any)?.fitnessReason, (autofillData as any)?.fitnessReason, ''),

      // Contact Info (from Part 4 modal) with autofill fallback
      contactName: getValueWithFallback((part4Data as any)?.contactName, (autofillData as any)?.contactName, ''),
      companyName: getValueWithFallback((part4Data as any)?.companyName, (autofillData as any)?.companyName, ''),
      address: getValueWithFallback((part4Data as any)?.address, (autofillData as any)?.address, ''),
      phone: getValueWithFallback((part4Data as any)?.phone, (autofillData as any)?.phone, ''),
      reconsideration: getValueWithFallback((part4Data as any)?.reconsideration, (autofillData as any)?.reconsideration, ''),
      reconsiderationProcedure: getValueWithFallback((part4Data as any)?.reconsiderationProcedure, (autofillData as any)?.reconsiderationProcedure, ''),
    };

    return combinedData;
  };

  const handleSendFinalRevocation = async () => {
    const combinedData = await getCombinedFormData();

    // Update the step5Storage with combined data for future use
    step5Storage.setFinalRevocationForm(combinedData);

    // Send the final revocation notice with combined data directly
    try {
      await sendFinalRevocation(combinedData);
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

          {isStep5CompletedFromDB && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Step 5 Completed - Final Revocation Notice Sent
                  </p>
                  <p className="text-sm text-red-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                    This step has been completed previously. The final revocation notice has been sent and the assessment process is complete. All data has been loaded from the database.
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
        part1Data={{
          // Basic info from Part 4
          date: (part4Data as any)?.currentDate || '',
          applicant: (part4Data as any)?.applicant || '',
          dateOfNotice: (part4Data as any)?.dateOfNotice || '',
        }}
        part2Data={{
          // Decision details from Part 1
          noResponse: (part1Data as any)?.noResponse || false,
          infoSubmitted: (part1Data as any)?.infoSubmitted || false,
          infoSubmittedList: (part1Data as any)?.infoSubmittedList || '',
          errorOnReport: (part1Data as any)?.errorOnReport || '',
          convictions: (part1Data as any)?.convictions || [],
        }}
        part3Data={{
          // Assessment details from Part 2
          seriousReason: (part2Data as any)?.seriousReason || '',
          timeSinceConduct: (part2Data as any)?.timeSinceConduct || '',
          timeSinceSentence: (part2Data as any)?.timeSinceSentence || '',
          position: (part2Data as any)?.position || '',
          jobDuties: (part2Data as any)?.jobDuties || [],
        }}
        part4Data={{
          // Final decision reasoning from Part 3 + contact info from Part 4
          fitnessReason: (part3Data as any)?.fitnessReason || '',
          contactName: (part4Data as any)?.contactName || '',
          companyName: (part4Data as any)?.companyName || '',
          address: (part4Data as any)?.address || '',
          phone: (part4Data as any)?.phone || '',
          reconsideration: (part4Data as any)?.reconsideration || '',
          reconsiderationProcedure: (part4Data as any)?.reconsiderationProcedure || '',
        }}
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
