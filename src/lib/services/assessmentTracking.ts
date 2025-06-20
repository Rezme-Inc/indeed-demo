import { supabase } from '@/lib/supabase';

interface AssessmentSession {
  id?: string;
  hr_admin_id: string;
  candidate_id: string;
  started_at?: string;
  completed_at?: string;
  final_decision?: 'hired' | 'revoked' | 'in_progress';
  metadata?: Record<string, any>;
}

interface AssessmentStep {
  session_id: string;
  step_number: number;
  question_id: string;
  answer: string;
  notes?: string;
}

interface AssessmentDocument {
  session_id: string;
  document_type: 'offer_letter' | 'assessment' | 'revocation_notice' | 'reassessment' | 'final_revocation';
  document_data: Record<string, any>;
  sent_at?: string;
}

interface AuditLogEntry {
  session_id: string;
  hr_admin_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

class AssessmentTrackingService {
  private static instance: AssessmentTrackingService;
  private currentSessionId: string | null = null;

  private constructor() {}

  static getInstance(): AssessmentTrackingService {
    if (!AssessmentTrackingService.instance) {
      AssessmentTrackingService.instance = new AssessmentTrackingService();
    }
    return AssessmentTrackingService.instance;
  }

  /**
   * Creates a new assessment session
   */
  async createSession(hrAdminId: string, candidateId: string, metadata: Record<string, any> = {}): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .insert({
          hr_admin_id: hrAdminId,
          candidate_id: candidateId,
          final_decision: 'in_progress',
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      this.currentSessionId = data.id;
      
      // Log session creation
      await this.logAction(hrAdminId, 'session_created', {
        candidate_id: candidateId,
        metadata
      });

      return data.id;
    } catch (error) {
      console.error('Error creating assessment session:', error);
      throw error;
    }
  }

  /**
   * Gets or creates a session for the given HR admin and candidate
   */
  async getOrCreateSession(hrAdminId: string, candidateId: string): Promise<string> {
    try {
      // First, check if there's an existing in-progress session
      const { data: existingSession, error: fetchError } = await supabase
        .from('assessment_sessions')
        .select('id')
        .eq('hr_admin_id', hrAdminId)
        .eq('candidate_id', candidateId)
        .eq('final_decision', 'in_progress')
        .single();

      if (existingSession && !fetchError) {
        this.currentSessionId = existingSession.id;
        return existingSession.id;
      }

      // If no existing session, create a new one
      return await this.createSession(hrAdminId, candidateId);
    } catch (error) {
      console.error('Error getting or creating session:', error);
      throw error;
    }
  }

  /**
   * Saves an assessment step/answer
   */
  async saveStep(
    stepNumber: number,
    questionId: string,
    answer: string,
    notes?: string
  ): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active assessment session');
    }

    try {
      // Check if step already exists
      const { data: existingStep } = await supabase
        .from('assessment_steps')
        .select('id')
        .eq('session_id', this.currentSessionId)
        .eq('question_id', questionId)
        .single();

      if (existingStep) {
        // Update existing step
        const { error } = await supabase
          .from('assessment_steps')
          .update({
            answer,
            notes,
            step_number: stepNumber
          })
          .eq('id', existingStep.id);

        if (error) throw error;
      } else {
        // Insert new step
        const { error } = await supabase
          .from('assessment_steps')
          .insert({
            session_id: this.currentSessionId,
            step_number: stepNumber,
            question_id: questionId,
            answer,
            notes
          });

        if (error) throw error;
      }

      // Update session metadata
      await this.updateSessionMetadata({
        last_step_completed: stepNumber,
        last_updated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error saving assessment step:', error);
      throw error;
    }
  }

  /**
   * Saves all answers at once (batch save)
   */
  async saveAllAnswers(
    answers: Record<string, string>,
    currentStep: number,
    notes?: string
  ): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active assessment session');
    }

    try {
      const steps = Object.entries(answers).map(([questionId, answer], index) => ({
        session_id: this.currentSessionId,
        step_number: index + 1,
        question_id: questionId,
        answer,
        notes: index + 1 === currentStep ? notes : undefined
      }));

      // Upsert all steps
      for (const step of steps) {
        await this.saveStep(step.step_number, step.question_id, step.answer, step.notes);
      }

    } catch (error) {
      console.error('Error saving all answers:', error);
      throw error;
    }
  }

  /**
   * Saves a document (offer letter, assessment form, etc.)
   */
  async saveDocument(
    documentType: AssessmentDocument['document_type'],
    documentData: Record<string, any>,
    wasSent: boolean = false
  ): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active assessment session');
    }

    try {
      const { error } = await supabase
        .from('assessment_documents')
        .insert({
          session_id: this.currentSessionId,
          document_type: documentType,
          document_data: documentData,
          sent_at: wasSent ? new Date().toISOString() : null
        });

      if (error) throw error;

      // Log document creation
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.logAction(session.user.id, `${documentType}_saved`, {
          document_type: documentType,
          was_sent: wasSent
        });
      }

    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  /**
   * Updates session metadata
   */
  async updateSessionMetadata(metadata: Record<string, any>): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active assessment session');
    }

    try {
      // First get existing metadata
      const { data: session, error: fetchError } = await supabase
        .from('assessment_sessions')
        .select('metadata')
        .eq('id', this.currentSessionId)
        .single();

      if (fetchError) throw fetchError;

      // Merge with new metadata
      const updatedMetadata = {
        ...(session.metadata || {}),
        ...metadata
      };

      const { error } = await supabase
        .from('assessment_sessions')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentSessionId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating session metadata:', error);
      throw error;
    }
  }

  /**
   * Completes the assessment session
   */
  async completeSession(finalDecision: 'hired' | 'revoked'): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active assessment session');
    }

    try {
      const { error } = await supabase
        .from('assessment_sessions')
        .update({
          final_decision: finalDecision,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentSessionId);

      if (error) throw error;

      // Log session completion
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.logAction(session.user.id, 'session_completed', {
          final_decision: finalDecision
        });
      }

    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  /**
   * Logs an action to the audit trail
   */
  async logAction(
    hrAdminId: string,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      // Get browser info
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;
      
      const { error } = await supabase
        .from('assessment_audit_log')
        .insert({
          session_id: this.currentSessionId,
          hr_admin_id: hrAdminId,
          action,
          details,
          user_agent: userAgent
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error logging action:', error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  /**
   * Retrieves a complete assessment record for reporting
   */
  async getAssessmentRecord(sessionId: string): Promise<any> {
    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select(`
          *,
          hr_admin:hr_admin_profiles(first_name, last_name, company),
          candidate:user_profiles(first_name, last_name, email)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get all steps
      const { data: steps, error: stepsError } = await supabase
        .from('assessment_steps')
        .select('*')
        .eq('session_id', sessionId)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Get all documents
      const { data: documents, error: docsError } = await supabase
        .from('assessment_documents')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at');

      if (docsError) throw docsError;

      // Get audit log
      const { data: auditLog, error: auditError } = await supabase
        .from('assessment_audit_log')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at');

      if (auditError) throw auditError;

      return {
        session,
        steps,
        documents,
        auditLog
      };

    } catch (error) {
      console.error('Error retrieving assessment record:', error);
      throw error;
    }
  }

  /**
   * Sets the current session ID (useful when resuming)
   */
  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Gets the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}

export const assessmentTracking = AssessmentTrackingService.getInstance(); 
