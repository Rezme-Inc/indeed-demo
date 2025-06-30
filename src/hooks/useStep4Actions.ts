import { useCallback } from "react";
import { getCandidateEmail, sendReassessmentEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep4Storage } from "./useStep4Storage";

interface Step4ActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedReassessment: React.Dispatch<React.SetStateAction<any>>;
  setInitialAssessmentResults: (v: any) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function useStep4Actions(
  candidateId: string,
  storage: ReturnType<typeof useStep4Storage>,
  options: Step4ActionOptions
) {
  const {
    reassessmentForm,
    setShowReassessmentInfoModal,
    setReassessmentPreview,
    setShowReassessmentSplit,
    reassessmentDecision,
    extendReason,
  } = storage;
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedReassessment,
    setInitialAssessmentResults,
    setCurrentStep,
  } = options;

  const sendReassessment = useCallback(async () => {
    const reassessmentData = {
      ...reassessmentForm,
      decision: reassessmentDecision,
      extendReason,
      sentAt: new Date().toISOString(),
      candidateId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendReassessmentEmail(reassessmentData, candidateEmail);

      setSavedReassessment(reassessmentData);

      // Wait for React state updates to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving reassessment...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "reassessment",
          reassessmentData,
          true
        );

        if (saved) {
          console.log("[Assessment Tracking] Reassessment saved to database");
          await safeAssessmentTracking.logAction(hrAdminId || "", "reassessment_sent", {
            recipient_email: candidateEmail,
            decision: reassessmentDecision,
            position: reassessmentData.position,
            error_found: reassessmentData.errorYesNo === "Yes",
          });
        }
      }

      setShowReassessmentInfoModal(false);
      setReassessmentPreview(false);
      setShowReassessmentSplit(false);
      setInitialAssessmentResults({ ...reassessmentForm });
      setCurrentStep(5);
    } catch (error) {
      console.error("Error in sendReassessment:", error);
    }
  }, [reassessmentForm, reassessmentDecision, extendReason, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedReassessment, setShowReassessmentInfoModal, setReassessmentPreview, setShowReassessmentSplit, setInitialAssessmentResults, setCurrentStep]);

  return { sendReassessment };
}
