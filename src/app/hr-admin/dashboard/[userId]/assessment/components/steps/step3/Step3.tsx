import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { Part1Modal, Part2Modal, Part3Modal, Part4Modal } from "./index";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import PreviewModal from "./PreviewModal";
import { useStep3Storage, RevocationForm } from "@/hooks/useStep3Storage";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useStep3Actions } from "@/hooks/useStep3Actions";
import { useUniversalHireActions } from "@/hooks/useUniversalHireActions";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";
import { useCandidateData } from "@/context/useCandidateData";
import { useAssessmentStorageContext } from "@/context/AssessmentStorageProvider";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

const Step3: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const { savedHireDecision, setSavedHireDecision, savedRevocationNotice, setSavedRevocationNotice } = useAssessmentStorage(userId as string);
  const { hrAdmin } = useHRAdminProfile();
  const { candidateProfile } = useCandidateData();
  const { step1Storage, step2Storage, step3Storage } = useAssessmentStorageContext();
  const [isStep3CompletedFromDB, setIsStep3CompletedFromDB] = useState(false);

  // Load Step 3 data on component mount
  useEffect(() => {
    const loadStep3Data = async () => {
      try {
        console.log('[Step3] Starting to load Step 3 data...');

        // Check if assessment exists
        const assessmentExists = await AssessmentDatabaseService.assessmentExists(userId as string);
        console.log('[Step3] Assessment exists:', assessmentExists);

        if (assessmentExists) {
          // Get current step to determine if Step 3 is completed
          const dbCurrentStep = await AssessmentDatabaseService.getCurrentStep(userId as string);
          console.log('[Step3] Current step from DB:', dbCurrentStep);

          // Step 3 is completed if current step > 3
          const isStep3Completed = dbCurrentStep > 3;
          console.log('[Step3] Step 3 completion status:', isStep3Completed);

          if (isStep3Completed) {
            console.log('[Step3] Step 3 is completed, loading from database...');
            const stepData = await AssessmentDatabaseService.getStepData(userId as string, 3);
            console.log('[Step3] Loaded step data from DB:', stepData);

            if (stepData) {
              // Update the revocation form with database data
              step3Storage.setRevocationForm(stepData as RevocationForm);

              // Map database data back to individual part data for the UI
              const dbData = stepData as RevocationForm;

              // Part 1 data mapping
              setPart1Data({
                date: dbData.date || '',
                applicantName: dbData.applicant || '',
                position: dbData.position || '',
                contactName: dbData.contactName || '',
                companyName: dbData.companyName || '',
                address: dbData.address || '',
                phone: dbData.phone || '',
              });

              // Part 2 data mapping
              setPart2Data({
                convictions: dbData.convictions || [],
                conductTimeAgo: dbData.timeSinceConduct || '',
                sentenceCompletedTimeAgo: dbData.timeSinceSentence || '',
              });

              // Part 3 data mapping
              setPart3Data({
                jobDuties: dbData.jobDuties || '',
                seriousnessReason: dbData.seriousReason || '',
                revocationReason: dbData.fitnessReason || '',
              });

              // Part 4 data mapping
              setPart4Data({
                businessDays: dbData.numBusinessDays || "5",
              });

              setIsStep3CompletedFromDB(true);
              console.log('[Step3] Step 3 data loaded from database and mapped to parts');
            }
          } else {
            console.log('[Step3] Step 3 not completed, using localStorage data');
          }
        } else {
          console.log('[Step3] No assessment exists, using localStorage data');
        }
      } catch (error) {
        console.error('[Step3] Error loading step data:', error);
        // Continue with localStorage data on error
      }
    };

    if (userId) {
      loadStep3Data();
    }
  }, [userId, step3Storage]);

  // Step 3 actions for sending revocation notice
  const { sendRevocation } = useStep3Actions(userId as string, step3Storage, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedRevocationNotice,
    setRevocationSentDate: () => { }, // Not used in this flow
    setCurrentStep,
  });

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useLocalStorageState(
    `step3_current_modal_step_${userId}`,
    1
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [showRevocationReviewModal, setShowRevocationReviewModal] = useState(false);

  // Form data for each part
  const [part1Data, setPart1Data] = useLocalStorageState(`step3_part1_${userId}`, {});
  const [part2Data, setPart2Data] = useLocalStorageState(`step3_part2_${userId}`, {});
  const [part3Data, setPart3Data] = useLocalStorageState(`step3_part3_${userId}`, {});
  const [part4Data, setPart4Data] = useLocalStorageState(`step3_part4_${userId}`, {});

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

  // Helper function to combine part data into RevocationForm format
  const getCombinedRevocationData = useCallback(() => {
    return {
      // Part 1 - Basic Info (mapping to RevocationForm fields)
      date: (part1Data as any)?.date || '',
      applicant: (part1Data as any)?.applicantName || '',
      position: (part1Data as any)?.position || '',
      contactName: (part1Data as any)?.contactName || '',
      companyName: (part1Data as any)?.companyName || '',
      address: (part1Data as any)?.address || '',
      phone: (part1Data as any)?.phone || '',

      // Part 2 - Conviction Details (mapping to RevocationForm fields)
      convictions: (part2Data as any)?.convictions || [],
      timeSinceConduct: (part2Data as any)?.conductTimeAgo || '',
      timeSinceSentence: (part2Data as any)?.sentenceCompletedTimeAgo || '',

      // Part 3 - Assessment Reasoning (mapping to RevocationForm fields)
      jobDuties: (part3Data as any)?.jobDuties || '',
      seriousReason: (part3Data as any)?.seriousnessReason || '',
      fitnessReason: (part3Data as any)?.revocationReason || '',

      // Part 4 - Response Period
      numBusinessDays: (part4Data as any)?.businessDays || "5", // Default to 5 if not set
    };
  }, [part1Data, part2Data, part3Data, part4Data]);

  // Sync part data to step3Storage whenever part data changes
  useEffect(() => {
    const combinedData = getCombinedRevocationData();
    // Only update if there's actual data to avoid unnecessary updates
    const hasData = combinedData.date || combinedData.applicant || combinedData.position ||
      (combinedData.convictions && combinedData.convictions.length > 0 && combinedData.convictions.some((c: string) => c.trim())) ||
      combinedData.jobDuties || combinedData.seriousReason || combinedData.fitnessReason;

    if (hasData) {
      step3Storage.setRevocationForm(combinedData);
    }
  }, [getCombinedRevocationData]);

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
      // Complete assessment - show revocation notice review
      console.log("Step 3 Assessment complete!", { part1Data, part2Data, part3Data, part4Data });
      closeModal();
      // Show revocation notice review modal
      setShowRevocationReviewModal(true);
    }
  };

  const goToPreviousStep = () => {
    if ((currentModalStep || 1) > 1) {
      setCurrentModalStep((currentModalStep || 1) - 1);
    }
  };

  const handleSendRevocationNotice = async () => {
    const combinedRevocationData = getCombinedRevocationData();

    // Update the step3Storage with combined data
    step3Storage.setRevocationForm(combinedRevocationData);

    // Wait a moment for the storage to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now send the revocation notice
    try {
      await sendRevocation();
      // Close the review modal after successful send
      setShowRevocationReviewModal(false);
    } catch (error) {
      console.error("Error sending revocation notice:", error);
    }
  };

  const { proceedWithHire } = useUniversalHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });

  const getButtonText = () => {
    const hasProgress = (currentModalStep || 1) > 1 ||
      Object.keys(part1Data || {}).length > 0 ||
      Object.keys(part2Data || {}).length > 0 ||
      Object.keys(part3Data || {}).length > 0 ||
      Object.keys(part4Data || {}).length > 0;

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

        {/* Step 3 Completion Notice */}
        {isStep3CompletedFromDB && (
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
                  Step 3 Completed
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  This preliminary revocation notice has been completed and saved to the database. The data shown below is loaded from the database.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Revocation Notice Sent Message */}
        {savedRevocationNotice && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-orange-900 mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Revocation Notice Sent
                </p>
                <p
                  className="text-sm text-orange-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Preliminary revocation notice sent on{" "}
                  {new Date(savedRevocationNotice.sentAt).toLocaleDateString()} to
                  the candidate. The assessment process continues to Step 4.
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
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision || savedRevocationNotice ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"
              }`}
            onClick={() => (savedHireDecision || savedRevocationNotice) ? undefined : openModal()}
            disabled={!!(savedHireDecision || savedRevocationNotice)}
            style={{
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#E54747",
            }}
          >
            {getButtonText()}
          </button>
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision
              ? "border-green-500 text-green-700 bg-green-50"
              : savedRevocationNotice
                ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-500"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => (savedHireDecision || savedRevocationNotice) ? undefined : proceedWithHire()}
            disabled={!!(savedHireDecision || savedRevocationNotice)}
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

      {/* Part 4 Modal */}
      <Part4Modal
        showModal={isModalOpen && (currentModalStep || 1) === 4}
        setShowModal={closeModal}
        formData={part4Data || {}}
        updateFormData={(updates) => setPart4Data({ ...(part4Data || {}), ...updates })}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        step1Storage={step1Storage}
        step2Storage={step2Storage}
        onNext={goToNextStep}
        onBack={goToPreviousStep}
        candidateId={userId}
      />

      <PreviewModal
        showModal={showRevocationReviewModal}
        setShowModal={setShowRevocationReviewModal}
        part1Data={part1Data}
        part2Data={part2Data}
        part3Data={part3Data}
        part4Data={part4Data}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        step1Storage={step1Storage}
        onBack={() => {
          setShowRevocationReviewModal(false);
          setIsModalOpen(true);
          setCurrentModalStep(4);
        }}
        onSend={handleSendRevocationNotice}
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
