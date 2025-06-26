import { useCallback } from "react";
import { getCandidateEmail, sendOfferLetterEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep1Storage } from "./useStep1Storage";

interface Step1ActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedOfferLetter: React.Dispatch<React.SetStateAction<any>>;
  handleNext: () => void;
}

export function useStep1Actions(
  candidateId: string,
  storage: ReturnType<typeof useStep1Storage>,
  options: Step1ActionOptions
) {
  const { offerForm, setShowOfferModal } = storage;
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedOfferLetter,
    handleNext,
  } = options;

  const sendOffer = useCallback(async () => {
    const offerLetterData = {
      ...offerForm,
      sentAt: new Date().toISOString(),
      candidateId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      company: hrAdminProfile?.company || "",
      timestamp: Date.now(),
    };

    try {
      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      const emailResult = await sendOfferLetterEmail(
        offerLetterData,
        candidateEmail
      );

      if (!emailResult.success) {
        console.error("Failed to send offer letter email:", emailResult.error);
      }

      setSavedOfferLetter(offerLetterData);

      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving offer letter...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "offer_letter",
          offerLetterData,
          true
        );

        if (saved) {
          console.log("[Assessment Tracking] Offer letter saved to database");
          await safeAssessmentTracking.logAction(hrAdminId || "", "offer_letter_sent", {
            recipient_email: candidateEmail,
            position: offerLetterData.position,
            employer: offerLetterData.employer,
          });
        }
      }

      setShowOfferModal(false);
      handleNext();
    } catch (error) {
      console.error("Error in sendOffer:", error);
    }
  }, [offerForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedOfferLetter, setShowOfferModal, handleNext]);

  return { sendOffer };
}
