import { assessmentTracking } from './assessmentTracking';

/**
 * Safe wrapper for assessment tracking that won't break the UI if tracking fails
 */
export const safeAssessmentTracking = {
  /**
   * Safely initialize or get a session
   */
  async initializeSession(hrAdminId: string, candidateId: string): Promise<string | null> {
    try {
      console.log('[SafeTracking] Initializing session...');
      const sessionId = await assessmentTracking.getOrCreateSession(hrAdminId, candidateId);
      console.log('[SafeTracking] Session initialized:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('[SafeTracking] Failed to initialize session:', error);
      return null;
    }
  },

  /**
   * Safely save a step
   */
  async saveStep(
    sessionId: string | null,
    stepNumber: number,
    questionId: string,
    answer: string,
    notes?: string
  ): Promise<boolean> {
    if (!sessionId) return false;
    
    try {
      await assessmentTracking.saveStep(stepNumber, questionId, answer, notes);
      console.log('[SafeTracking] Step saved:', { stepNumber, questionId, answer });
      return true;
    } catch (error) {
      console.error('[SafeTracking] Failed to save step:', error);
      return false;
    }
  },

  /**
   * Safely save a document
   */
  async saveDocument(
    sessionId: string | null,
    documentType: 'offer_letter' | 'assessment' | 'revocation_notice' | 'reassessment' | 'final_revocation',
    documentData: any,
    sent: boolean = false
  ): Promise<boolean> {
    if (!sessionId) return false;
    
    try {
      await assessmentTracking.saveDocument(documentType, documentData, sent);
      console.log('[SafeTracking] Document saved:', { documentType, sent });
      return true;
    } catch (error) {
      console.error('[SafeTracking] Failed to save document:', error);
      return false;
    }
  },

  /**
   * Safely log an action
   */
  async logAction(
    hrAdminId: string | null,
    action: string,
    details?: any
  ): Promise<boolean> {
    if (!hrAdminId) return false;
    
    try {
      await assessmentTracking.logAction(hrAdminId, action, details);
      console.log('[SafeTracking] Action logged:', { action, details });
      return true;
    } catch (error) {
      console.error('[SafeTracking] Failed to log action:', error);
      return false;
    }
  },

  /**
   * Safely complete a session
   */
  async completeSession(
    sessionId: string | null,
    finalDecision: 'hired' | 'revoked'
  ): Promise<boolean> {
    if (!sessionId) return false;
    
    try {
      await assessmentTracking.completeSession(finalDecision);
      console.log('[SafeTracking] Session completed:', { finalDecision });
      return true;
    } catch (error) {
      console.error('[SafeTracking] Failed to complete session:', error);
      return false;
    }
  },

  /**
   * Check if tracking is available (tables exist and user has permission)
   */
  async isAvailable(): Promise<boolean> {
    try {
      const { supabase } = await import('../supabase');
      const { data, error } = await supabase
        .from('assessment_sessions')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('[SafeTracking] Tracking not available:', error.message);
        return false;
      }
      
      console.log('[SafeTracking] Tracking is available');
      return true;
    } catch (error) {
      console.error('[SafeTracking] Error checking availability:', error);
      return false;
    }
  }
}; 
