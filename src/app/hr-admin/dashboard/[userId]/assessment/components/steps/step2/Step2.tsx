import React, { useState, useEffect } from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import { Part1Modal, Part2Modal, Part3Modal, Part4Modal, Part5Modal, PreviewModal } from "./index";
import ExtendSuccessModal from "../../common/ExtendSuccessModal";
import { useStep2Storage, AssessmentForm } from "@/hooks/useStep2Storage";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useStep2Actions } from "@/hooks/useStep2Actions";
import { useUniversalHireActions } from "@/hooks/useUniversalHireActions";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useParams } from "next/navigation";
import { useCandidateData } from "@/context/useCandidateData";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

const Step2: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState("Legal");
  const { currentStep, setCurrentStep } = useAssessmentSteps();
  const [isStep2CompletedFromDB, setIsStep2CompletedFromDB] = useState(false);

  // Separate state for modal visibility (independent of step tracking)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    savedHireDecision,
    setSavedHireDecision,
    setSavedAssessment,
  } = useAssessmentStorage(userId as string);
  const step2Storage = useStep2Storage(userId as string);
  const {
    assessmentForm,
    setAssessmentForm,
    currentModalStep,
    setCurrentModalStep,
    handleAssessmentFormChange,
    handleAssessmentArrayChange,
  } = step2Storage;
  const { hrAdmin } = useHRAdminProfile();
  const { candidateProfile } = useCandidateData();
  const { addDuty, addActivity, removeDuty, removeActivity } = useAssessmentMutators(
    setAssessmentForm,
    (() => { }) as React.Dispatch<React.SetStateAction<any>>
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
  const { proceedWithHire } = useUniversalHireActions(userId as string, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  });

  // Load Step 2 data on component mount
  useEffect(() => {
    const loadStep2Data = async () => {
      try {
        console.log('[Step2] Starting to load Step 2 data...');

        // Check if assessment exists
        const assessmentExists = await AssessmentDatabaseService.assessmentExists(userId as string);
        console.log('[Step2] Assessment exists:', assessmentExists);

        if (assessmentExists) {
          // Get current step to determine if Step 2 is completed
          const dbCurrentStep = await AssessmentDatabaseService.getCurrentStep(userId as string);
          console.log('[Step2] Current step from DB:', dbCurrentStep);

          // Step 2 is completed if current step > 2
          const isStep2Completed = dbCurrentStep > 2;
          console.log('[Step2] Step 2 completion status:', isStep2Completed);

          if (isStep2Completed) {
            console.log('[Step2] Step 2 is completed, loading from database...');
            const stepData = await AssessmentDatabaseService.getStepData(userId as string, 2);
            console.log('[Step2] Loaded step data from DB:', stepData);

            if (stepData) {
              // Update the assessment form with database data
              setAssessmentForm(stepData as AssessmentForm);
              setIsStep2CompletedFromDB(true);
              console.log('[Step2] Step 2 data loaded from database');
            }
          } else {
            console.log('[Step2] Step 2 not completed, using localStorage data');
          }
        } else {
          console.log('[Step2] No assessment exists, using localStorage data');
        }
      } catch (error) {
        console.error('[Step2] Error loading step data:', error);
        // Continue with localStorage data on error
      }
    };

    if (userId) {
      loadStep2Data();
    }
  }, [userId, setAssessmentForm]);

  // Modal navigation functions
  const handleNext = () => {
    if (currentModalStep === 1) setCurrentModalStep(2);
    else if (currentModalStep === 2) setCurrentModalStep(3);
    else if (currentModalStep === 3) setCurrentModalStep(4);
    else if (currentModalStep === 4) setCurrentModalStep(5);
    else if (currentModalStep === 5) setCurrentModalStep('preview');
  };

  const handleBack = () => {
    if (currentModalStep === 2) setCurrentModalStep(1);
    else if (currentModalStep === 3) setCurrentModalStep(2);
    else if (currentModalStep === 4) setCurrentModalStep(3);
    else if (currentModalStep === 5) setCurrentModalStep(4);
    else if (currentModalStep === 'preview') setCurrentModalStep(5);
  };

  const handleSaveForLater = () => {
    // Just close the modal but keep the step progress saved
    setIsModalOpen(false);
    // currentModalStep remains unchanged so user can resume later
  };

  // Control background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scrolling is restored if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-6 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Individualized Assessment
        </h2>

        {/* Step 2 Completion Notice */}
        {isStep2CompletedFromDB && (
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
                  Step 2 Completed
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  This individualized assessment has been completed and saved to the database. The data shown below is loaded from the database.
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
            onClick={() => {
              if (savedHireDecision) return;
              setCurrentModalStep(currentModalStep || 1);
              setIsModalOpen(true);
            }}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
          >
            {currentModalStep ? "Continue Assessment" : "Begin Individualized Assessment"}
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

      {/* Multi-step Assessment Modals */}
      <Part1Modal
        showModal={isModalOpen && currentModalStep === 1}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        handleAssessmentFormChange={handleAssessmentFormChange}
        handleAssessmentArrayChange={handleAssessmentArrayChange}
        onAddDuty={addDuty}
        onRemoveDuty={removeDuty}
        onNext={handleNext}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      <Part2Modal
        showModal={isModalOpen && currentModalStep === 2}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        handleAssessmentFormChange={handleAssessmentFormChange}
        onNext={handleNext}
        onBack={handleBack}
      />

      <Part3Modal
        showModal={isModalOpen && currentModalStep === 3}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        handleAssessmentArrayChange={handleAssessmentArrayChange}
        onAddActivity={addActivity}
        onRemoveActivity={removeActivity}
        onNext={handleNext}
        onBack={handleBack}
      />

      <Part4Modal
        showModal={isModalOpen && currentModalStep === 4}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        handleAssessmentFormChange={handleAssessmentFormChange}
        onNext={handleNext}
        onBack={handleBack}
      />

      <Part5Modal
        showModal={isModalOpen && currentModalStep === 5}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        handleAssessmentFormChange={handleAssessmentFormChange}
        onNext={handleNext}
        onBack={handleBack}
        candidateProfile={candidateProfile}
        hrAdmin={hrAdmin}
        candidateId={userId as string}
      />

      <PreviewModal
        showModal={isModalOpen && currentModalStep === 'preview'}
        setShowModal={handleSaveForLater}
        assessmentForm={assessmentForm}
        onBack={handleBack}
        onSend={() => {
          sendAssessment();
          setCurrentModalStep(null); // Clear progress only after successful send
          setIsModalOpen(false);
        }}
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
