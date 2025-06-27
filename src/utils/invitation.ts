/**
 * Generate a secure invitation code for HR admins
 */
export const generateSecureCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Get the current assessment step for a user
 */
export const getCurrentAssessmentStep = (user: any) => {
  if (!user?.compliance_steps) {
    return 'pending';
  }
  
  const steps = user.compliance_steps;
  
  if (!steps.conditional_job_offer) return 'conditional_job_offer';
  if (!steps.individualized_assessment) return 'individualized_assessment';
  if (!steps.preliminary_job_offer_revocation) return 'preliminary_job_offer_revocation';
  if (!steps.individualized_reassessment) return 'individualized_reassessment';
  if (!steps.final_revocation_notice) return 'final_revocation_notice';
  if (!steps.decision) return 'decision';
  
  return 'completed';
}; 