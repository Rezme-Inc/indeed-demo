import { AssessmentDatabaseService } from './assessmentDatabase';
import { supabase } from '../supabase';
import { HRAdminProfile } from './hrAdmin';

export interface CandidateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: any;
}

export interface DocumentDataBase {
  candidateProfile: CandidateProfile | null;
  hrAdminProfile: HRAdminProfile | null;
}

export interface OfferLetterData extends DocumentDataBase {
  step1Data: any;
}

export interface AssessmentData extends DocumentDataBase {
  step1Data: any;
  step2Data: any;
}

export interface RevocationNoticeData extends DocumentDataBase {
  step3Data: any;
  step1Data?: any; // Optional for reference
  step2Data?: any; // Optional for reference
}

export interface ReassessmentData extends DocumentDataBase {
  step4Data: any;
  step1Data?: any; // Optional for reference
  step2Data?: any; // Optional for reference
  step3Data?: any; // Optional for reference
}

export interface FinalRevocationData extends DocumentDataBase {
  step5Data: any;
  step1Data?: any; // Optional for reference
  step2Data?: any; // Optional for reference
  step3Data?: any; // Optional for reference
  step4Data?: any; // Optional for reference
}

export class DocumentDataService {
  // Fetch candidate profile
  static async getCandidateProfile(candidateId: string): Promise<CandidateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) {
        console.error('[DocumentDataService] Error fetching candidate profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DocumentDataService] Exception fetching candidate profile:', error);
      return null;
    }
  }

  // Fetch HR admin profile
  static async getHRAdminProfile(): Promise<HRAdminProfile | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('hr_profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (error) {
        console.error('[DocumentDataService] Error fetching HR admin profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DocumentDataService] Exception fetching HR admin profile:', error);
      return null;
    }
  }

  // Fetch offer letter data (Step 1 + profiles)
  static async getOfferLetterData(candidateId: string): Promise<OfferLetterData | null> {
    try {
      console.log('[DocumentDataService] Fetching offer letter data for candidate:', candidateId);

      const [candidateProfile, hrAdminProfile, step1Data] = await Promise.all([
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile(),
        AssessmentDatabaseService.getStepData(candidateId, 1)
      ]);

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      return {
        candidateProfile,
        hrAdminProfile,
        step1Data: step1Data || {}
      };
    } catch (error) {
      console.error('[DocumentDataService] Error fetching offer letter data:', error);
      return null;
    }
  }

  // Fetch assessment document data (Steps 1-2 + profiles)
  static async getAssessmentData(candidateId: string): Promise<AssessmentData | null> {
    try {
      console.log('[DocumentDataService] Fetching assessment data for candidate:', candidateId);

      const [candidateProfile, hrAdminProfile, step1Data, step2Data] = await Promise.all([
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile(),
        AssessmentDatabaseService.getStepData(candidateId, 1),
        AssessmentDatabaseService.getStepData(candidateId, 2)
      ]);

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      return {
        candidateProfile,
        hrAdminProfile,
        step1Data: step1Data || {},
        step2Data: step2Data || {}
      };
    } catch (error) {
      console.error('[DocumentDataService] Error fetching assessment data:', error);
      return null;
    }
  }

  // Fetch revocation notice data (Step 3 + profiles + optional previous steps)
  static async getRevocationNoticeData(candidateId: string, includePreviousSteps: boolean = false): Promise<RevocationNoticeData | null> {
    try {
      console.log('[DocumentDataService] Fetching revocation notice data for candidate:', candidateId);

      const promises = [
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile(),
        AssessmentDatabaseService.getStepData(candidateId, 3)
      ];

      if (includePreviousSteps) {
        promises.push(
          AssessmentDatabaseService.getStepData(candidateId, 1),
          AssessmentDatabaseService.getStepData(candidateId, 2)
        );
      }

      const results = await Promise.all(promises);
      const candidateProfile = results[0] as CandidateProfile | null;
      const hrAdminProfile = results[1] as HRAdminProfile | null;
      const step3Data = results[2];
      const step1Data = includePreviousSteps ? results[3] : undefined;
      const step2Data = includePreviousSteps ? results[4] : undefined;

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      return {
        candidateProfile,
        hrAdminProfile,
        step3Data: step3Data || {},
        ...(includePreviousSteps && {
          step1Data: step1Data || {},
          step2Data: step2Data || {}
        })
      };
    } catch (error) {
      console.error('[DocumentDataService] Error fetching revocation notice data:', error);
      return null;
    }
  }

  // Fetch reassessment data (Step 4 + profiles + optional previous steps)
  static async getReassessmentData(candidateId: string, includePreviousSteps: boolean = false): Promise<ReassessmentData | null> {
    try {
      console.log('[DocumentDataService] Fetching reassessment data for candidate:', candidateId);

      const promises = [
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile(),
        AssessmentDatabaseService.getStepData(candidateId, 4)
      ];

      if (includePreviousSteps) {
        promises.push(
          AssessmentDatabaseService.getStepData(candidateId, 1),
          AssessmentDatabaseService.getStepData(candidateId, 2),
          AssessmentDatabaseService.getStepData(candidateId, 3)
        );
      }

      const results = await Promise.all(promises);
      const candidateProfile = results[0] as CandidateProfile | null;
      const hrAdminProfile = results[1] as HRAdminProfile | null;
      const step4Data = results[2];
      const step1Data = includePreviousSteps ? results[3] : undefined;
      const step2Data = includePreviousSteps ? results[4] : undefined;
      const step3Data = includePreviousSteps ? results[5] : undefined;

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      return {
        candidateProfile,
        hrAdminProfile,
        step4Data: step4Data || {},
        ...(includePreviousSteps && {
          step1Data: step1Data || {},
          step2Data: step2Data || {},
          step3Data: step3Data || {}
        })
      };
    } catch (error) {
      console.error('[DocumentDataService] Error fetching reassessment data:', error);
      return null;
    }
  }

  // Fetch final revocation data (Step 5 + profiles + optional previous steps)
  static async getFinalRevocationData(candidateId: string, includePreviousSteps: boolean = false): Promise<FinalRevocationData | null> {
    try {
      console.log('[DocumentDataService] Fetching final revocation data for candidate:', candidateId);

      const promises = [
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile(),
        AssessmentDatabaseService.getStepData(candidateId, 5)
      ];

      if (includePreviousSteps) {
        promises.push(
          AssessmentDatabaseService.getStepData(candidateId, 1),
          AssessmentDatabaseService.getStepData(candidateId, 2),
          AssessmentDatabaseService.getStepData(candidateId, 3),
          AssessmentDatabaseService.getStepData(candidateId, 4)
        );
      }

      const results = await Promise.all(promises);
      const candidateProfile = results[0] as CandidateProfile | null;
      const hrAdminProfile = results[1] as HRAdminProfile | null;
      const step5Data = results[2];
      const step1Data = includePreviousSteps ? results[3] : undefined;
      const step2Data = includePreviousSteps ? results[4] : undefined;
      const step3Data = includePreviousSteps ? results[5] : undefined;
      const step4Data = includePreviousSteps ? results[6] : undefined;

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      return {
        candidateProfile,
        hrAdminProfile,
        step5Data: step5Data || {},
        ...(includePreviousSteps && {
          step1Data: step1Data || {},
          step2Data: step2Data || {},
          step3Data: step3Data || {},
          step4Data: step4Data || {}
        })
      };
    } catch (error) {
      console.error('[DocumentDataService] Error fetching final revocation data:', error);
      return null;
    }
  }

  // Generic method to get combined data for preview (localStorage + database)
  static async getCombinedDocumentData(
    candidateId: string,
    currentStepData: any,
    currentStep: number,
    documentType: 'offer_letter' | 'assessment' | 'revocation_notice' | 'reassessment' | 'final_revocation'
  ): Promise<any> {
    try {
      console.log(`[DocumentDataService] Getting combined data for ${documentType}, current step:`, currentStep);

      // Always get profiles
      const [candidateProfile, hrAdminProfile] = await Promise.all([
        this.getCandidateProfile(candidateId),
        this.getHRAdminProfile()
      ]);

      if (!candidateProfile) {
        console.error('[DocumentDataService] Failed to fetch candidate profile');
        return null;
      }

      // Get previous step data from database
      const previousStepPromises = [];
      for (let step = 1; step < currentStep; step++) {
        previousStepPromises.push(AssessmentDatabaseService.getStepData(candidateId, step));
      }

      const previousStepData = await Promise.all(previousStepPromises);
      const dbData: any = { candidateProfile, hrAdminProfile };

      // Map previous step data
      for (let i = 0; i < previousStepData.length; i++) {
        const stepNumber = i + 1;
        dbData[`step${stepNumber}Data`] = previousStepData[i] || {};
      }

      // Add current step data from localStorage
      dbData[`step${currentStep}Data`] = currentStepData || {};

      console.log(`[DocumentDataService] Combined data for ${documentType}:`, dbData);
      return dbData;
    } catch (error) {
      console.error(`[DocumentDataService] Error getting combined data for ${documentType}:`, error);
      return null;
    }
  }
} 
