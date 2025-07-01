import { useEffect, useState } from 'react';
import { AssessmentDatabaseService } from '@/lib/services/assessmentDatabase';

export interface DocumentAvailability {
  hasAssessment: boolean;
  hasRevocationNotice: boolean;
  hasReassessment: boolean;
  hasFinalRevocationNotice: boolean;
  loading: boolean;
}

/**
 * Hook to check database for completed steps and determine which documents are available for viewing.
 * This replaces the localStorage-based approach to ensure documents are only shown when actually completed.
 */
export function useDocumentAvailability(candidateId: string): DocumentAvailability {
  const [availability, setAvailability] = useState<DocumentAvailability>({
    hasAssessment: false,
    hasRevocationNotice: false,
    hasReassessment: false,
    hasFinalRevocationNotice: false,
    loading: true,
  });

  useEffect(() => {
    async function checkDocumentAvailability() {
      if (!candidateId) {
        setAvailability(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('[DocumentAvailability] Checking database for completed steps...');
        
        // Get the current assessment status from database
        const assessmentStatus = await AssessmentDatabaseService.getAssessmentStatus(candidateId);
        
        if (!assessmentStatus) {
          console.log('[DocumentAvailability] No assessment found in database');
          setAvailability(prev => ({ ...prev, loading: false }));
          return;
        }

        const currentStep = assessmentStatus.current_step;
        console.log('[DocumentAvailability] Current step from database:', currentStep);

        // Check which steps have data in the database (excluding Step 1 - offer letter)
        const stepData = await Promise.all([
          AssessmentDatabaseService.getStepData(candidateId, 2), // Assessment  
          AssessmentDatabaseService.getStepData(candidateId, 3), // Revocation Notice
          AssessmentDatabaseService.getStepData(candidateId, 4), // Reassessment
          AssessmentDatabaseService.getStepData(candidateId, 5), // Final Revocation
        ]);

        const [step2Data, step3Data, step4Data, step5Data] = stepData;

        setAvailability({
          hasAssessment: !!step2Data,
          hasRevocationNotice: !!step3Data,
          hasReassessment: !!step4Data,
          hasFinalRevocationNotice: !!step5Data,
          loading: false,
        });

        console.log('[DocumentAvailability] Document availability:', {
          hasAssessment: !!step2Data,
          hasRevocationNotice: !!step3Data,
          hasReassessment: !!step4Data,
          hasFinalRevocationNotice: !!step5Data,
        });

      } catch (error) {
        console.error('[DocumentAvailability] Error checking document availability:', error);
        setAvailability(prev => ({ ...prev, loading: false }));
      }
    }

    checkDocumentAvailability();
  }, [candidateId]);

  return availability;
} 
