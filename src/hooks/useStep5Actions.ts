import { useCallback } from "react";
import { getCandidateEmail, sendFinalRevocationEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { supabase } from "@/lib/supabase";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep5Storage } from "./useStep5Storage";

interface Step5ActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedFinalRevocationNotice: React.Dispatch<React.SetStateAction<any>>;
  setShowFinalRevocationSuccessModal: (v: boolean) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function useStep5Actions(
  candidateId: string,
  storage: ReturnType<typeof useStep5Storage>,
  options: Step5ActionOptions
) {
  const {
    finalRevocationForm,
    setShowFinalRevocationModal,
    setFinalRevocationPreview,
  } = storage;
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedFinalRevocationNotice,
    setShowFinalRevocationSuccessModal,
    setCurrentStep,
  } = options;

  const sendFinalRevocation = useCallback(async () => {
    const finalRevocationData = {
      ...finalRevocationForm,
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

      await sendFinalRevocationEmail(finalRevocationData, candidateEmail);

      setSavedFinalRevocationNotice(finalRevocationData);

      // Wait for React state updates to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving final revocation notice...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "final_revocation",
          finalRevocationData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Final revocation saved to database"
          );

          await safeAssessmentTracking.completeSession(
            assessmentSessionId,
            "revoked"
          );

          await safeAssessmentTracking.logAction(hrAdminId || "", "final_revocation_sent", {
            recipient_email: candidateEmail,
            position: finalRevocationData.position,
            no_response: finalRevocationData.noResponse,
            info_submitted: finalRevocationData.infoSubmitted,
          });
        }
      }

      setShowFinalRevocationModal(false);
      setFinalRevocationPreview(false);
      setShowFinalRevocationSuccessModal(true);
      setCurrentStep(6);

      try {
        await supabase
          .from("user_profiles")
          .update({ final_decision: "Revoked" })
          .eq("id", candidateId);
      } catch (error) {
        console.error("Error updating final_decision in Supabase:", error);
      }
    } catch (error) {
      console.error("Error in sendFinalRevocation:", error);
    }
  }, [finalRevocationForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedFinalRevocationNotice, setShowFinalRevocationModal, setFinalRevocationPreview, setShowFinalRevocationSuccessModal, setCurrentStep]);

  return { sendFinalRevocation };
}
