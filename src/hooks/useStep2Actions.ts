import { useCallback } from "react";
import { getCandidateEmail, sendAssessmentEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep2Storage } from "./useStep2Storage";

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
      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendAssessmentEmail(assessmentData, candidateEmail);

      setSavedAssessment(assessmentData);

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
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error in sendAssessment:", error);
    }
  }, [assessmentForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedAssessment, setShowAssessmentModal, setAssessmentPreview, setInitialAssessmentResults, setCurrentStep]);

  return { sendAssessment };
}
