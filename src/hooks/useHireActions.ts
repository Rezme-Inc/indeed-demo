import { useCallback } from 'react';
import { safeAssessmentTracking } from '@/lib/services/safeAssessmentTracking';
import { supabase } from '@/lib/supabase';
import { HRAdminProfile } from '@/lib/services/hrAdmin';

interface HireActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedHireDecision: React.Dispatch<React.SetStateAction<any>>;
  setSavedPreliminaryDecision?: React.Dispatch<React.SetStateAction<any>>;
  setShowReassessmentInfoModal?: (v: boolean) => void;
  setShowExtendSuccessModal: (v: boolean) => void;
  currentStep: number;
}

export function useHireActions(candidateId: string, options: HireActionOptions) {
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedHireDecision,
    setSavedPreliminaryDecision,
    setShowReassessmentInfoModal,
    setShowExtendSuccessModal,
    currentStep,
  } = options;

  const proceedWithHire = useCallback(async () => {
    const hireDecisionData = {
      decision: 'hire',
      decisionType: 'hired',
      sentAt: new Date().toISOString(),
      candidateId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : '',
      companyName: hrAdminProfile?.company || '',
    };

    setSavedHireDecision(hireDecisionData);

    try {
      await supabase
        .from('user_profiles')
        .update({ final_decision: 'Hired' })
        .eq('id', candidateId);

      if (trackingActive && assessmentSessionId) {
        await safeAssessmentTracking.completeSession(
          assessmentSessionId,
          'hired'
        );

        await safeAssessmentTracking.logAction(hrAdminId || '', 'candidate_hired', {
          candidate_id: candidateId,
          step_when_hired: currentStep,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating final_decision in Supabase:', error);
    }

    setShowExtendSuccessModal(true);
  }, [
    candidateId,
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    currentStep,
    setSavedHireDecision,
    setShowExtendSuccessModal,
  ]);

  const proceedWithReassessment = useCallback(() => {
    const reassessmentDecisionData = {
      decision: 'reassessment',
      decisionType: 'adverse_action',
      sentAt: new Date().toISOString(),
      candidateId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : '',
      companyName: hrAdminProfile?.company || '',
    };

    setSavedPreliminaryDecision?.(reassessmentDecisionData);
    setShowReassessmentInfoModal?.(true);
  }, [
    candidateId,
    hrAdminProfile,
    setSavedPreliminaryDecision,
    setShowReassessmentInfoModal,
  ]);

  return { proceedWithHire, proceedWithReassessment };
}
