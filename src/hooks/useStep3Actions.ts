import { useCallback } from "react";
import { getCandidateEmail, sendRevocationEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep3Storage } from "./useStep3Storage";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";
import { useDocumentRefresh } from "@/context/DocumentRefreshContext";

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

  const { refreshDocuments } = useDocumentRefresh();

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
      console.log('[Step3Actions] Starting to send revocation and save to database...');

      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendRevocationEmail(revocationData, candidateEmail);

      setSavedRevocationNotice(revocationData);

      // Save Step 3 data to database and update current step to 4
      console.log('[Step3Actions] Completing Step 3 and updating to Step 4...');
      if (revocationForm) {
        await AssessmentDatabaseService.completeStep(candidateId, 3, revocationForm, 4);
      }

      // Clear localStorage for Step 3
      console.log('[Step3Actions] Clearing Step 3 localStorage...');
      localStorage.removeItem(`revocationForm_${candidateId}`);
      localStorage.removeItem(`step3_current_modal_step_${candidateId}`);
      localStorage.removeItem(`step3_part1_${candidateId}`);
      localStorage.removeItem(`step3_part2_${candidateId}`);
      localStorage.removeItem(`step3_part3_${candidateId}`);
      localStorage.removeItem(`step3_part4_${candidateId}`);
      localStorage.removeItem(`revocationNotice_${candidateId}`); // Clear main revocation notice key that controls View Documents dropdown

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
      
      // Refresh document availability to show the new revocation notice
      console.log('[Step3Actions] Refreshing document availability...');
      await refreshDocuments();
      
      console.log('[Step3Actions] Step 3 completed successfully');
    } catch (error) {
      console.error("Error in sendRevocation:", error);
    }
  }, [revocationForm, candidateId, hrAdminProfile, hrAdminId, trackingActive, assessmentSessionId, setSavedRevocationNotice, setShowRevocationModal, setRevocationPreview, setRevocationSentDate, setCurrentStep, refreshDocuments]);

  return { sendRevocation };
}
