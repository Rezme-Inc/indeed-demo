export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday?: string;
  interests?: string[];
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  avatar_url?: string;
  rr_completed: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
} 