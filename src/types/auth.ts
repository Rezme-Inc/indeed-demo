export type UserRole = "user" | "hr_admin" | "rezme_admin";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  is_visible_to_hr: boolean;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  legal_name?: string;
  preferred_name?: string;
  gender?: string;
  pronouns?: string;
}

export interface HrAdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone?: string;
  company_address?: string;
  connected_users: string[];
  invitation_code: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RezmeAdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
  updated_at?: string;
}
 