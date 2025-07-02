import { useCallback } from 'react';
import { AssessmentDatabaseService } from '@/lib/services/assessmentDatabase';
import { supabase } from '@/lib/supabase';
import { HRAdminProfile } from '@/lib/services/hrAdmin';
import { safeAssessmentTracking } from '@/lib/services/safeAssessmentTracking';
import { useDocumentRefresh } from '@/context/DocumentRefreshContext';

interface UniversalHireActionOptions {
  hrAdminProfile: HRAdminProfile | null;
  hrAdminId: string | null;
  trackingActive: boolean;
  assessmentSessionId: string | null;
  setSavedHireDecision: React.Dispatch<React.SetStateAction<any>>;
  setShowExtendSuccessModal: (v: boolean) => void;
  currentStep: number;
}

export function useUniversalHireActions(candidateId: string, options: UniversalHireActionOptions) {
  const {
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    currentStep,
  } = options;

  const { refreshDocuments } = useDocumentRefresh();

  const proceedWithHire = useCallback(async () => {
    try {
      console.log(`[UniversalHire] Starting hire process at Step ${currentStep} for candidate ${candidateId}`);

      const hireDecisionData = {
        decision: 'hire',
        decisionType: 'hired',
        sentAt: new Date().toISOString(),
        candidateId,
        hrAdminName: hrAdminProfile
          ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
          : '',
        companyName: hrAdminProfile?.company || '',
        stepWhenHired: currentStep,
        completedAt: new Date().toISOString(),
      };

      // 1. Update local state immediately for UI feedback
      setSavedHireDecision(hireDecisionData);

      // 2. Mark assessment as completed with hire status in database
      const assessmentExists = await AssessmentDatabaseService.assessmentExists(candidateId);
      
      if (assessmentExists) {
        console.log('[UniversalHire] Marking assessment as completed with hire status');
        
        // Mark assessment as completed (set current step to 6 which means "completed")
        const success = await AssessmentDatabaseService.completeStep(
          candidateId,
          currentStep,
          {
            hire_decision: hireDecisionData,
            final_status: 'hired',
            completed_at: new Date().toISOString(),
            step_when_hired: currentStep,
          },
          6 // Step 6 indicates assessment is fully completed
        );

        if (!success) {
          console.error('[UniversalHire] Failed to mark assessment as completed in database');
          throw new Error('Failed to save hire decision to database');
        }
      } else {
        console.warn('[UniversalHire] No assessment found, creating new one with hire decision');
        
        // Create assessment record with hire decision
        const initSuccess = await AssessmentDatabaseService.initializeAssessment(candidateId);
        if (initSuccess) {
          await AssessmentDatabaseService.completeStep(
            candidateId,
            currentStep,
            {
              hire_decision: hireDecisionData,
              final_status: 'hired',
              completed_at: new Date().toISOString(),
              step_when_hired: currentStep,
            },
            6
          );
        }
      }

      // 3. Update user profile with final decision
      console.log('[UniversalHire] Updating user profile with hire decision');
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ final_decision: 'Hired' })
        .eq('id', candidateId);

      if (profileUpdateError) {
        console.error('[UniversalHire] Error updating user profile:', profileUpdateError);
      }

      // 4. Clear all localStorage data for this candidate
      console.log('[UniversalHire] Clearing localStorage data');
      const keysToRemove = [
        // Step 1 localStorage keys
        `step1_job_results_${candidateId}`,
        `step1_offer_results_${candidateId}`,
        `step1_job_approved_${candidateId}`,
        `step1_offer_approved_${candidateId}`,
        `step1_manual_job_data_${candidateId}`,
        `step1_manual_offer_data_${candidateId}`,
        `step1_jobDescription_file_${candidateId}`,
        `step1_offerLetter_file_${candidateId}`,
        `step1_backgroundReport_file_${candidateId}`,
        
        // Step 2 localStorage keys
        `step2_assessment_form_${candidateId}`,
        `step2_current_modal_step_${candidateId}`,
        
        // Step 3 localStorage keys
        `step3_revocation_form_${candidateId}`,
        `step3_current_modal_step_${candidateId}`,
        `step3_part1_${candidateId}`,
        `step3_part2_${candidateId}`,
        `step3_part3_${candidateId}`,
        `step3_part4_${candidateId}`,
        
        // Step 4 localStorage keys
        `step4_reassessment_form_${candidateId}`,
        `step4_reassessment_preview_${candidateId}`,
        `step4_reassessment_decision_${candidateId}`,
        `step4_extend_reason_${candidateId}`,
        `step4_show_reassessment_split_${candidateId}`,
        `step4_show_reassessment_info_modal_${candidateId}`,
        
        // Step 5 localStorage keys
        `step5_final_revocation_form_${candidateId}`,
        `step5_current_modal_step_${candidateId}`,
        `step5_part1_${candidateId}`,
        `step5_part2_${candidateId}`,
        `step5_part3_${candidateId}`,
        `step5_part4_${candidateId}`,
        
        // Assessment storage keys
        `assessment_saved_hire_decision_${candidateId}`,
        `assessment_saved_assessment_${candidateId}`,
        `assessment_saved_preliminary_decision_${candidateId}`,
        `assessment_saved_reassessment_${candidateId}`,
        `assessment_saved_revocation_notice_${candidateId}`,
        `assessment_saved_final_revocation_${candidateId}`,
      ];

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`[UniversalHire] Failed to remove localStorage key: ${key}`, error);
        }
      });

      console.log('[UniversalHire] Cleared all localStorage data');

      // 5. Log assessment tracking if active
      if (trackingActive && assessmentSessionId) {
        try {
          await safeAssessmentTracking.completeSession(
            assessmentSessionId,
            'hired'
          );

          await safeAssessmentTracking.logAction(hrAdminId || '', 'candidate_hired', {
            candidate_id: candidateId,
            step_when_hired: currentStep,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('[UniversalHire] Error in assessment tracking:', error);
          // Don't fail the hire process if tracking fails
        }
      }

      // 6. Refresh document availability
      console.log('[UniversalHire] Refreshing document availability...');
      await refreshDocuments();

      // 7. Show success modal
      console.log('[UniversalHire] Hire process completed successfully');
      setShowExtendSuccessModal(true);

    } catch (error) {
      console.error('[UniversalHire] Error during hire process:', error);
      
      // Reset the hire decision if something failed
      setSavedHireDecision(null);
      
      // Show user-friendly error
      alert('Failed to complete hire decision. Please try again.');
    }
  }, [
    candidateId,
    hrAdminProfile,
    hrAdminId,
    trackingActive,
    assessmentSessionId,
    currentStep,
    setSavedHireDecision,
    setShowExtendSuccessModal,
    refreshDocuments,
  ]);

  return { proceedWithHire };
} 
