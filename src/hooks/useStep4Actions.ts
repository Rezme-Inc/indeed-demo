import { useCallback } from "react";
import { getCandidateEmail, sendReassessmentEmail } from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { HRAdminProfile } from "@/lib/services/hrAdmin";
import { useStep4Storage } from "./useStep4Storage";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

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
    if (!reassessmentForm) {
      console.error('[Step4] Reassessment form is null, cannot send');
      return;
    }

    // Create streamlined data structure
    const evidenceFields = [
      reassessmentForm.evidenceA,
      reassessmentForm.evidenceB,
      reassessmentForm.evidenceC,
      reassessmentForm.evidenceD
    ].filter(evidence => evidence && evidence.trim());

    const reassessmentData = {
      error: reassessmentForm.error || "",
      sentAt: new Date().toISOString(),
      decision: reassessmentDecision,
      employer: reassessmentForm.employer || "",
      position: reassessmentForm.position || "",
      applicant: reassessmentForm.applicant || "",
      evidence: evidenceFields,
      offerDate: reassessmentForm.offerDate || "",
      errorYesNo: reassessmentForm.errorYesNo || "No",
      reportDate: reassessmentForm.reportDate || "",
      candidateId,
      companyName: hrAdminProfile?.company || "",
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      performedBy: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      extendReason: reassessmentDecision === "extend" ? extendReason : "",
      rescindReason: reassessmentForm.rescindReason || "",
      reassessmentDate: reassessmentForm.reassessmentDate || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(candidateId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendReassessmentEmail(reassessmentData, candidateEmail);

      setSavedReassessment(reassessmentData);

      // Save to database and advance to next step
      console.log('[Step4] Saving reassessment data to database...');
      const dbSaved = await AssessmentDatabaseService.completeStep(
        candidateId,
        4,
        reassessmentData,
        5 // Move to step 5
      );

      if (dbSaved) {
        console.log('[Step4] Reassessment data saved to database successfully');
        
        // Clear localStorage for Step 4
        const step4Keys = [
          `reassessmentForm_${candidateId}`,
        ];
        
        step4Keys.forEach(key => {
          console.log(`[Step4] Clearing localStorage key: ${key}`);
          localStorage.removeItem(key);
        });
        
        console.log('[Step4] Step 4 localStorage cleared');
      } else {
        console.error('[Step4] Failed to save reassessment data to database');
      }

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
