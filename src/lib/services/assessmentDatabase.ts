import { supabase } from '@/lib/supabase';

export interface StepData {
  [key: string]: any;
}

export interface AssessmentStatus {
  current_step: number;
  status: string;
  completed_at_step?: number;
}

export interface CompletedStep {
  step_number: number;
  step_data: StepData;
  completed_at: string;
}

export class AssessmentDatabaseService {
  // UUID validation helper
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Initialize assessment when first step is accessed
  static async initializeAssessment(candidateId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    console.log('[AssessmentDB] Initializing assessment for candidate:', candidateId);

    const { error } = await supabase
      .from('assessments_new')
      .upsert({
        hr_id: user.user.id,
        candidate_id: candidateId,
        current_step: 1,
        status: 'in_progress'
      });

    if (error) {
      console.error('[AssessmentDB] Error initializing assessment:', error);
      return false;
    }

    console.log('[AssessmentDB] Assessment initialized successfully');
    return true;
  }

  // Get current step from database
  static async getCurrentStep(candidateId: string): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return 1;

    try {
      const { data, error } = await supabase
        .from('assessments_new')
        .select('current_step')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[AssessmentDB] Assessment not found, returning step 1');
          return 1;
        }
        console.error('[AssessmentDB] Error getting current step:', error);
        return 1;
      }

      return data?.current_step || 1;
    } catch (err) {
      console.error('[AssessmentDB] Exception in getCurrentStep:', err);
      return 1;
    }
  }

  // Save step data and advance to next step
  static async completeStep(
    candidateId: string, 
    stepNumber: number, 
    stepData: StepData,
    nextStep: number
  ): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const hrId = user.user.id;

    console.log('[AssessmentDB] Completing step:', {
      candidateId,
      stepNumber,
      nextStep,
      stepDataKeys: Object.keys(stepData)
    });

    // Save step data
    const { error: stepError } = await supabase
      .from('assessment_steps_new')
      .upsert({
        hr_id: hrId,
        candidate_id: candidateId,
        step_number: stepNumber,
        step_data: stepData
      });

    if (stepError) {
      console.error('[AssessmentDB] Error saving step data:', stepError);
      return false;
    }

    // Update current step to the specified next step
    const { error: assessmentError } = await supabase
      .from('assessments_new')
      .update({
        current_step: nextStep,
        updated_at: new Date().toISOString()
      })
      .eq('hr_id', hrId)
      .eq('candidate_id', candidateId);

    if (assessmentError) {
      console.error('[AssessmentDB] Error updating current step:', assessmentError);
      return false;
    }

    console.log('[AssessmentDB] Step completed successfully');
    return true;
  }

  // Mark assessment as completed with hire decision
  static async completeAssessmentWithHire(
    candidateId: string,
    currentStep: number
  ): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('assessments_new')
      .update({
        status: 'hired',
        completed_at_step: currentStep,
        updated_at: new Date().toISOString()
      })
      .eq('hr_id', user.user.id)
      .eq('candidate_id', candidateId);

    return !error;
  }

  // Mark assessment as completed with reject decision
  static async completeAssessmentWithReject(
    candidateId: string,
    currentStep: number
  ): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('assessments_new')
      .update({
        status: 'revoked',
        completed_at_step: currentStep,
        updated_at: new Date().toISOString()
      })
      .eq('hr_id', user.user.id)
      .eq('candidate_id', candidateId);

    return !error;
  }

  // Get step data for a specific step
  static async getStepData(candidateId: string, stepNumber: number): Promise<StepData | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('[AssessmentDB] No authenticated user');
      return null;
    }

    console.log('[AssessmentDB] getStepData params:', {
      hrId: user.user.id,
      candidateId,
      stepNumber,
      hrIdType: typeof user.user.id,
      candidateIdType: typeof candidateId,
      stepNumberType: typeof stepNumber
    });

    try {
      const { data, error } = await supabase
        .from('assessment_steps_new')
        .select('step_data')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .eq('step_number', stepNumber)
        .single();

      console.log('[AssessmentDB] Query result:', { data, error });

      if (error) {
        // Handle "not found" errors gracefully
        if (error.code === 'PGRST116') {
          console.log('[AssessmentDB] Step data not found (expected for new steps)');
          return null;
        }
        console.error('[AssessmentDB] Query error:', error);
        return null;
      }

      return data?.step_data;
    } catch (err) {
      console.error('[AssessmentDB] Exception in getStepData:', err);
      return null;
    }
  }

  // Get all completed steps for autofill purposes
  static async getAllCompletedSteps(candidateId: string): Promise<CompletedStep[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('assessment_steps_new')
      .select('step_number, step_data, completed_at')
      .eq('hr_id', user.user.id)
      .eq('candidate_id', candidateId)
      .order('step_number');

    return error ? [] : data;
  }

  // Get current assessment status
  static async getAssessmentStatus(candidateId: string): Promise<AssessmentStatus | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    try {
      const { data, error } = await supabase
        .from('assessments_new')
        .select('current_step, status, completed_at_step')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .single();

      if (error) {
        // Handle "not found" errors gracefully
        if (error.code === 'PGRST116') {
          console.log('[AssessmentDB] Assessment not found (will be created)');
          return null;
        }
        console.error('[AssessmentDB] Assessment status query error:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[AssessmentDB] Exception in getAssessmentStatus:', err);
      return null;
    }
  }

  // Get assessment status for multiple candidates (for dashboard)
  static async getMultipleAssessmentStatus(candidateIds: string[]): Promise<Map<string, AssessmentStatus>> {
    const { data: user } = await supabase.auth.getUser();
    const statusMap = new Map<string, AssessmentStatus>();
    
    if (!user.user || candidateIds.length === 0) return statusMap;

    try {
      const { data, error } = await supabase
        .from('assessments_new')
        .select('candidate_id, current_step, status, completed_at_step')
        .eq('hr_id', user.user.id)
        .in('candidate_id', candidateIds);

      if (error) {
        console.error('[AssessmentDB] Error getting multiple assessment statuses:', error);
        // Return default status for all candidates
        candidateIds.forEach(id => {
          statusMap.set(id, { current_step: 1, status: 'not_started' });
        });
        return statusMap;
      }

      // Process found assessments
      if (data) {
        data.forEach((assessment: { candidate_id: string; current_step: number; status: string; completed_at_step?: number }) => {
          statusMap.set(assessment.candidate_id, {
            current_step: assessment.current_step,
            status: assessment.status,
            completed_at_step: assessment.completed_at_step
          });
        });
      }

      // Add default status for candidates not found in assessments
      candidateIds.forEach(id => {
        if (!statusMap.has(id)) {
          statusMap.set(id, { current_step: 1, status: 'not_started' });
        }
      });

      return statusMap;
    } catch (err) {
      console.error('[AssessmentDB] Exception in getMultipleAssessmentStatus:', err);
      // Return default status for all candidates on error
      candidateIds.forEach(id => {
        statusMap.set(id, { current_step: 1, status: 'not_started' });
      });
      return statusMap;
    }
  }

  // Check if assessment exists
  static async assessmentExists(candidateId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    try {
      const { data, error } = await supabase
        .from('assessments_new')
        .select('id')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .single();

      if (error) {
        // Handle "not found" errors - this means assessment doesn't exist
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('[AssessmentDB] Assessment exists check error:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('[AssessmentDB] Exception in assessmentExists:', err);
      return false;
    }
  }

  // Check if specific step is completed
  static async isStepCompleted(candidateId: string, stepNumber: number): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    console.log('[AssessmentDB] isStepCompleted params:', {
      hrId: user.user.id,
      candidateId,
      stepNumber
    });

    try {
      // First, check if we have step data in assessment_steps_new
      const { data: stepData, error: stepError } = await supabase
        .from('assessment_steps_new')
        .select('id')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .eq('step_number', stepNumber)
        .single();

      // If we found step data, the step is completed
      if (stepData && !stepError) {
        console.log('[AssessmentDB] Step found in assessment_steps_new - completed');
        return true;
      }

      // If the error is not "not found", there's a real issue
      if (stepError && stepError.code !== 'PGRST116') {
        console.error('[AssessmentDB] Error checking step data:', stepError);
        return false;
      }

      // Step data not found, check if current step is greater than requested step
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments_new')
        .select('current_step')
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId)
        .single();

      if (assessmentError) {
        if (assessmentError.code === 'PGRST116') {
          console.log('[AssessmentDB] Assessment not found - step not completed');
          return false;
        }
        console.error('[AssessmentDB] Error checking assessment:', assessmentError);
        return false;
      }

      // Step is completed if current step is greater than requested step
      const isCompleted = assessmentData.current_step > stepNumber;
      console.log('[AssessmentDB] Step completion check:', {
        currentStep: assessmentData.current_step,
        requestedStep: stepNumber,
        isCompleted
      });

      return isCompleted;
    } catch (err) {
      console.error('[AssessmentDB] Exception in isStepCompleted:', err);
      return false;
    }
  }

  // Save step data to database
  static async saveStepData(candidateId: string, stepNumber: number, stepData: StepData): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('[AssessmentDB] No authenticated user for saveStepData');
      return false;
    }

    console.log('[AssessmentDB] saveStepData params:', {
      hrId: user.user.id,
      candidateId,
      stepNumber,
      stepData
    });

    try {
      // Use upsert to either insert or update the step data
      const { data, error } = await supabase
        .from('assessment_steps_new')
        .upsert({
          hr_id: user.user.id,
          candidate_id: candidateId,
          step_number: stepNumber,
          step_data: stepData,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'hr_id,candidate_id,step_number'
        });

      if (error) {
        console.error('[AssessmentDB] Error saving step data:', error);
        return false;
      }

      console.log('[AssessmentDB] Step data saved successfully');
      return true;
    } catch (err) {
      console.error('[AssessmentDB] Exception in saveStepData:', err);
      return false;
    }
  }

  // Update current step in assessments_new table
  static async updateCurrentStep(candidateId: string, newStep: number): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('[AssessmentDB] No authenticated user for updateCurrentStep');
      return false;
    }

    console.log('[AssessmentDB] updateCurrentStep params:', {
      hrId: user.user.id,
      candidateId,
      newStep
    });

    try {
      const { data, error } = await supabase
        .from('assessments_new')
        .update({
          current_step: newStep,
          updated_at: new Date().toISOString()
        })
        .eq('hr_id', user.user.id)
        .eq('candidate_id', candidateId);

      if (error) {
        console.error('[AssessmentDB] Error updating current step:', error);
        return false;
      }

      console.log('[AssessmentDB] Current step updated successfully');
      return true;
    } catch (err) {
      console.error('[AssessmentDB] Exception in updateCurrentStep:', err);
      return false;
    }
  }
} 
