-- Fix RLS policies for introduction table
-- This resolves the 406 error when users try to access their own introduction data

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own introduction" ON introduction;
DROP POLICY IF EXISTS "Users can insert their own introduction" ON introduction;
DROP POLICY IF EXISTS "Users can update their own introduction" ON introduction;
DROP POLICY IF EXISTS "Users can delete their own introduction" ON introduction;
DROP POLICY IF EXISTS "Allow public read with share token" ON introduction;

-- Enable RLS
ALTER TABLE introduction ENABLE ROW LEVEL SECURITY;

-- Create new policies that properly handle user access

-- Policy 1: Users can view their own introduction (using auth.uid())
CREATE POLICY "Users can view their own introduction"
    ON introduction FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own introduction
CREATE POLICY "Users can insert their own introduction"
    ON introduction FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own introduction
CREATE POLICY "Users can update their own introduction"
    ON introduction FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own introduction
CREATE POLICY "Users can delete their own introduction"
    ON introduction FOR DELETE
    USING (auth.uid() = user_id);

-- Policy 5: Allow public read when user has share_token (for shared restorative records)
CREATE POLICY "Allow public read with share token"
    ON introduction FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = introduction.user_id 
            AND user_profiles.share_token IS NOT NULL
        )
    );

-- Policy 6: HR admins can view introduction when they have permission
CREATE POLICY "HR admins can view with permission"
    ON introduction FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_hr_permissions
            WHERE user_hr_permissions.user_id = introduction.user_id
            AND user_hr_permissions.hr_admin_id = auth.uid()
            AND user_hr_permissions.is_active = true
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_introduction_user_id ON introduction(user_id); 
