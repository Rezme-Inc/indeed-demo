-- Add invitation_code column to hr_admin_profiles
-- This column stores unique invitation codes for HR admins to share with users
ALTER TABLE hr_admin_profiles
ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hr_admin_profiles_invitation_code ON hr_admin_profiles(invitation_code); 
