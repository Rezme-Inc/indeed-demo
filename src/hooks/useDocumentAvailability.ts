import { useEffect, useState, useCallback } from 'react';
import { AssessmentDatabaseService } from '@/lib/services/assessmentDatabase';
import { FileStorageService, UploadedFile } from '@/lib/services/fileStorageService';

export interface DocumentAvailability {
  hasAssessment: boolean;
  hasRevocationNotice: boolean;
  hasReassessment: boolean;
  hasFinalRevocationNotice: boolean;
  uploadedFiles: UploadedFile[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check database for completed steps and determine which documents are available for viewing.
 * This replaces the localStorage-based approach to ensure documents are only shown when actually completed.
 * Only checks for step data after Step 1 is completed to avoid failed queries.
 */
export function useDocumentAvailability(candidateId: string): DocumentAvailability {
  const [availability, setAvailability] = useState<DocumentAvailability>({
    hasAssessment: false,
    hasRevocationNotice: false,
    hasReassessment: false,
    hasFinalRevocationNotice: false,
    uploadedFiles: [],
    loading: true,
    refresh: async () => {}, // Placeholder, will be replaced
  });

  const checkDocumentAvailability = useCallback(async () => {
      if (!candidateId) {
        setAvailability(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        console.log('[DocumentAvailability] Checking database for completed steps...');
        
        // Get the current assessment status from database
        const assessmentStatus = await AssessmentDatabaseService.getAssessmentStatus(candidateId);
        
        if (!assessmentStatus) {
          console.log('[DocumentAvailability] No assessment found in database - still on Step 1');
          // Only fetch uploaded files, no step data queries needed
          const uploadedFiles = await FileStorageService.getCandidateFiles(candidateId);
          setAvailability(prev => ({
            ...prev,
            hasAssessment: false,
            hasRevocationNotice: false,
            hasReassessment: false,
            hasFinalRevocationNotice: false,
            uploadedFiles: uploadedFiles,
            loading: false,
          }));
          return;
        }

        const currentStep = assessmentStatus.current_step;
        console.log('[DocumentAvailability] Current step from database:', currentStep);

        // If still on Step 1, don't query for step data - just get uploaded files
        if (currentStep <= 1) {
          console.log('[DocumentAvailability] Still on Step 1, skipping step data queries');
          const uploadedFiles = await FileStorageService.getCandidateFiles(candidateId);
          setAvailability(prev => ({
            ...prev,
            hasAssessment: false,
            hasRevocationNotice: false,
            hasReassessment: false,
            hasFinalRevocationNotice: false,
            uploadedFiles: uploadedFiles,
            loading: false,
          }));
          return;
        }

        // Only query for steps that could potentially be completed based on current step
        const stepQueries = [];
        const stepNumbers = [];

        if (currentStep >= 2) {
          stepQueries.push(AssessmentDatabaseService.getStepData(candidateId, 2));
          stepNumbers.push(2);
        }
        if (currentStep >= 3) {
          stepQueries.push(AssessmentDatabaseService.getStepData(candidateId, 3));
          stepNumbers.push(3);
        }
        if (currentStep >= 4) {
          stepQueries.push(AssessmentDatabaseService.getStepData(candidateId, 4));
          stepNumbers.push(4);
        }
        if (currentStep >= 5) {
          stepQueries.push(AssessmentDatabaseService.getStepData(candidateId, 5));
          stepNumbers.push(5);
        }

        console.log('[DocumentAvailability] Querying step data for steps:', stepNumbers);

        // Fetch step data and uploaded files
        const [stepDataResults, uploadedFiles] = await Promise.all([
          Promise.all(stepQueries),
          FileStorageService.getCandidateFiles(candidateId)
        ]);

        // Map results to availability
        const newAvailability = {
          hasAssessment: false,
          hasRevocationNotice: false,
          hasReassessment: false,
          hasFinalRevocationNotice: false,
          uploadedFiles: uploadedFiles,
          loading: false,
        };

        stepNumbers.forEach((stepNumber, index) => {
          const hasData = !!stepDataResults[index];
          switch (stepNumber) {
            case 2:
              newAvailability.hasAssessment = hasData;
              break;
            case 3:
              newAvailability.hasRevocationNotice = hasData;
              break;
            case 4:
              newAvailability.hasReassessment = hasData;
              break;
            case 5:
              newAvailability.hasFinalRevocationNotice = hasData;
              break;
          }
        });

        setAvailability(prev => ({
          ...prev,
          ...newAvailability,
        }));

        console.log('[DocumentAvailability] Document availability:', {
          currentStep,
          hasAssessment: newAvailability.hasAssessment,
          hasRevocationNotice: newAvailability.hasRevocationNotice,
          hasReassessment: newAvailability.hasReassessment,
          hasFinalRevocationNotice: newAvailability.hasFinalRevocationNotice,
          uploadedFilesCount: uploadedFiles.length,
        });

      } catch (error) {
        console.error('[DocumentAvailability] Error checking document availability:', error);
        // On error, just show uploaded files and no documents
        try {
          const uploadedFiles = await FileStorageService.getCandidateFiles(candidateId);
          setAvailability(prev => ({
            ...prev,
            hasAssessment: false,
            hasRevocationNotice: false,
            hasReassessment: false,
            hasFinalRevocationNotice: false,
            uploadedFiles: uploadedFiles,
            loading: false,
          }));
        } catch (fileError) {
          console.error('[DocumentAvailability] Error fetching uploaded files:', fileError);
          setAvailability(prev => ({ ...prev, loading: false }));
        }
      }
    }, [candidateId]);

  // Create refresh function
  const refresh = useCallback(async () => {
    setAvailability(prev => ({ ...prev, loading: true }));
    await checkDocumentAvailability();
  }, [checkDocumentAvailability]);

  // Update availability with refresh function
  const availabilityWithRefresh = {
    ...availability,
    refresh,
  };

  useEffect(() => {
    checkDocumentAvailability();
  }, [checkDocumentAvailability]);

  return availabilityWithRefresh;
} 
