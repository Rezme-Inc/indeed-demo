-- Add rr_completed field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS rr_completed BOOLEAN DEFAULT false;

-- Add avatar_url field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing records to have rr_completed = false (if needed)
UPDATE user_profiles 
SET rr_completed = false 
WHERE rr_completed IS NULL; 
