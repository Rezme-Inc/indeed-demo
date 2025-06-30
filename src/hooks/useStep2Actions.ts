import { useCallback } from "react";
import { getCandidateEmail, sendAssessmentEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep2Storage } from "./useStep2Storage";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

interface Step2ActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedAssessment: React.Dispatch<React.SetStateAction<any>>;
  setInitialAssessmentResults: (v: any) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function useStep2Actions(
  candidateId: string,
  storage: ReturnType<typeof useStep2Storage>,
  options: Step2ActionOptions
) {
  const {
    assessmentForm,
    setShowAssessmentModal,
    setAssessmentPreview,
    setCurrentModalStep,
  } = storage;
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedAssessment,
    setInitialAssessmentResults,
    setCurrentStep,
  } = options;

  const sendAssessment = useCallback(async () => {
    const assessmentData = {
      ...assessmentForm,
      decision: "rescind",
      sentAt: new Date().toISOString(),
      candidateId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      console.log('[Step2Actions] Starting to send assessment and save to database...');

      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendAssessmentEmail(assessmentData, candidateEmail);

      setSavedAssessment(assessmentData);

      // Save Step 2 data to database and update current step to 3
      console.log('[Step2Actions] Completing Step 2 and updating to Step 3...');
      if (assessmentForm) {
        await AssessmentDatabaseService.completeStep(candidateId, 2, assessmentForm, 3);
      }

      // Clear localStorage for Step 2
      console.log('[Step2Actions] Clearing Step 2 localStorage...');
      localStorage.removeItem(`assessmentForm_${candidateId}`);
      localStorage.removeItem(`assessmentModalStep_${candidateId}`);

      // Wait for React state updates to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving individual assessment...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "assessment",
          assessmentData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Individual assessment saved to database"
          );
          await safeAssessmentTracking.logAction(hrAdminId || "", "assessment_sent", {
            recipient_email: candidateEmail,
            position: assessmentData.position,
            rescind_reason: assessmentData.rescindReason,
          });
        }
      }

      setShowAssessmentModal(false);
      setAssessmentPreview(false);
      setInitialAssessmentResults({ ...assessmentForm });
      setCurrentStep(3);
      
      console.log('[Step2Actions] Step 2 completed successfully');
    } catch (error) {
      console.error("Error in sendAssessment:", error);
    }
  }, [assessmentForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedAssessment, setShowAssessmentModal, setAssessmentPreview, setInitialAssessmentResults, setCurrentStep]);

  return { sendAssessment };
}
