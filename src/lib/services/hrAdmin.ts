import { supabase } from '@/lib/supabase';

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

  return (userProfiles || []).map((profile: any) => {
    const permission = permissions.find((p: any) => p.user_id === profile.id);
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
    } as PermittedUser;
  });
}
