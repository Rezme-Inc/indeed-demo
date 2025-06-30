import { useCallback } from "react";
import { getCandidateEmail, sendRevocationEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep3Storage } from "./useStep3Storage";

interface Step3ActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedRevocationNotice: React.Dispatch<React.SetStateAction<any>>;
  setRevocationSentDate: (d: Date) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function useStep3Actions(
  candidateId: string,
  storage: ReturnType<typeof useStep3Storage>,
  options: Step3ActionOptions
) {
  const {
    revocationForm,
    setShowRevocationModal,
    setRevocationPreview,
  } = storage;
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedRevocationNotice,
    setRevocationSentDate,
    setCurrentStep,
  } = options;

  const sendRevocation = useCallback(async () => {
    const revocationData = {
      ...revocationForm,
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

      await sendRevocationEmail(revocationData, candidateEmail);

      setSavedRevocationNotice(revocationData);

      // Wait for React state updates to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving revocation notice...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "revocation_notice",
          revocationData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Revocation notice saved to database"
          );
          await safeAssessmentTracking.logAction(hrAdminId || "", "revocation_notice_sent", {
            recipient_email: candidateEmail,
            business_days: (revocationForm as any).numBusinessDays,
            convictions: (revocationForm as any).convictions.filter((c: string) => c),
            position: (revocationForm as any).position,
          });
        }
      }

      setShowRevocationModal(false);
      setRevocationPreview(false);
      setRevocationSentDate(new Date());
      setCurrentStep(4);
    } catch (error) {
      console.error("Error in sendRevocation:", error);
    }
  }, [revocationForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedRevocationNotice, setShowRevocationModal, setRevocationPreview, setRevocationSentDate, setCurrentStep]);

  return { sendRevocation };
}
