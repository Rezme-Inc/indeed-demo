-- Add share_token column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_share_token ON user_profiles(share_token);

-- Add RLS policy to allow public access to shared profiles
CREATE POLICY "Anyone can view shared profiles"
    ON user_profiles FOR SELECT
    USING (share_token IS NOT NULL);

-- Add function to generate new share token
CREATE OR REPLACE FUNCTION generate_new_share_token(user_id UUID)
RETURNS UUID AS $$
BEGIN
    UPDATE user_profiles
    SET share_token = gen_random_uuid()
    WHERE id = user_id;
    
    RETURN (SELECT share_token FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 