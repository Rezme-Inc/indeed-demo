import { supabase } from '@/lib/supabase';
import { AssessmentDatabaseService, AssessmentStatus } from './assessmentDatabase';

export interface HRAdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone?: string;
  company_address?: string;
  invitation_code?: string;
}

export interface PermittedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  granted_at?: string;
  final_decision?: string;
  assessment_status?: AssessmentStatus;
  compliance_steps?: {
    conditional_job_offer: boolean;
    individualized_assessment: boolean;
    preliminary_job_offer_revocation: boolean;
    individualized_reassessment: boolean;
    final_revocation_notice: boolean;
    decision: boolean;
  };
}

export async function getHRAdminProfile(id: string): Promise<HRAdminProfile | null> {
  const { data, error } = await supabase
    .from('hr_admin_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data as HRAdminProfile;
}

// Helper function to calculate compliance steps based on current step
function calculateComplianceSteps(assessmentStatus: AssessmentStatus | null) {
  const currentStep = assessmentStatus?.current_step || 1;
  const status = assessmentStatus?.status || 'not_started';
  
  return {
    conditional_job_offer: currentStep >= 2,
    individualized_assessment: currentStep >= 3,
    preliminary_job_offer_revocation: currentStep >= 4,
    individualized_reassessment: currentStep >= 5,
    final_revocation_notice: currentStep >= 6 || status === 'revoked',
    decision: status === 'hired' || status === 'revoked'
  };
}

export async function getPermittedUsers(hrAdminId: string): Promise<PermittedUser[]> {
  const { data: permissions, error: permError } = await supabase
    .from('user_hr_permissions')
    .select('user_id, granted_at')
    .eq('hr_admin_id', hrAdminId)
    .eq('is_active', true);

  if (permError) throw permError;

  if (!permissions || permissions.length === 0) {
    return [];
  }

  const userIds = permissions.map((p: any) => p.user_id);
  const { data: userProfiles, error: userError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', userIds);

  if (userError) throw userError;

  // Fetch assessment status for all users
  const assessmentStatusMap = await AssessmentDatabaseService.getMultipleAssessmentStatus(userIds);

  return (userProfiles || []).map((profile: any) => {
    const permission = permissions.find((p: any) => p.user_id === profile.id);
    const assessmentStatus = assessmentStatusMap.get(profile.id) || null;
    
    return {
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birthday: profile.birthday ?? null,
      interests: profile.interests ?? [],
      rr_completed: profile.rr_completed,
      final_decision: profile.final_decision,
      granted_at: permission?.granted_at ?? undefined,
      assessment_status: assessmentStatus,
      compliance_steps: calculateComplianceSteps(assessmentStatus),
    } as PermittedUser;
  });
}
