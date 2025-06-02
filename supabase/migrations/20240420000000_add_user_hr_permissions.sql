-- Create user_hr_permissions table for managing which HR admins can view user profiles
CREATE TABLE user_hr_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hr_admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, hr_admin_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_hr_permissions_user_id ON user_hr_permissions(user_id);
CREATE INDEX idx_user_hr_permissions_hr_admin_id ON user_hr_permissions(hr_admin_id);
CREATE INDEX idx_user_hr_permissions_active ON user_hr_permissions(is_active) WHERE is_active = true;

-- Add updated_at trigger
CREATE TRIGGER update_user_hr_permissions_updated_at
    BEFORE UPDATE ON user_hr_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_hr_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own permissions"
    ON user_hr_permissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can grant permissions to HR admins"
    ON user_hr_permissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke permissions (soft delete)"
    ON user_hr_permissions FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for HR admins
CREATE POLICY "HR admins can view permissions granted to them"
    ON user_hr_permissions FOR SELECT
    USING (auth.uid() = hr_admin_id AND is_active = true);

-- Policies for Rezme admins
CREATE POLICY "Rezme admins can view all permissions"
    ON user_hr_permissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Migrate existing connected_users data
INSERT INTO user_hr_permissions (user_id, hr_admin_id, granted_at, is_active)
SELECT 
    unnest(hr.connected_users) as user_id,
    hr.id as hr_admin_id,
    hr.created_at as granted_at,
    true as is_active
FROM hr_admin_profiles hr
WHERE hr.connected_users IS NOT NULL 
    AND array_length(hr.connected_users, 1) > 0
ON CONFLICT (user_id, hr_admin_id) DO NOTHING;

-- Update the HR admin view profile policy to check the new permissions table
DROP POLICY IF EXISTS "HR Admins can view all users" ON user_profiles;

CREATE POLICY "HR Admins can view users who granted them permission"
    ON user_profiles FOR SELECT
    USING (
        auth.uid() = id OR -- Users can view their own profile
        EXISTS (
            SELECT 1 FROM user_hr_permissions uhp
            WHERE uhp.user_id = user_profiles.id 
                AND uhp.hr_admin_id = auth.uid()
                AND uhp.is_active = true
        )
    );

-- Create a view for HR admins to easily query their permitted users
CREATE OR REPLACE VIEW hr_permitted_users AS
SELECT 
    up.*,
    uhp.granted_at,
    uhp.hr_admin_id
FROM user_profiles up
JOIN user_hr_permissions uhp ON up.id = uhp.user_id
WHERE uhp.is_active = true; 
