-- Fix RLS Policies for Shared Restorative Record Access
-- Run this in Supabase SQL Editor

-- First, let's ensure all tables have RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE introduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment ENABLE ROW LEVEL SECURITY;
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read with share token" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read with share token" ON introduction;
DROP POLICY IF EXISTS "Allow public read with share token" ON awards;
DROP POLICY IF EXISTS "Allow public read with share token" ON skills;
DROP POLICY IF EXISTS "Allow public read with share token" ON community_engagements;
DROP POLICY IF EXISTS "Allow public read with share token" ON rehab_programs;
DROP POLICY IF EXISTS "Allow public read with share token" ON micro_credentials;
DROP POLICY IF EXISTS "Allow public read with share token" ON mentors;
DROP POLICY IF EXISTS "Allow public read with share token" ON education;
DROP POLICY IF EXISTS "Allow public read with share token" ON employment;
DROP POLICY IF EXISTS "Allow public read with share token" ON hobbies;

-- User Profiles - Allow public read when share_token exists
CREATE POLICY "Allow public read with share token" ON user_profiles
FOR SELECT
USING (share_token IS NOT NULL);

-- Introduction - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON introduction
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = introduction.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Awards - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON awards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = awards.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Skills - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON skills
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = skills.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Community Engagements - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON community_engagements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = community_engagements.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Rehab Programs - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON rehab_programs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = rehab_programs.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Micro Credentials - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON micro_credentials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = micro_credentials.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Mentors - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON mentors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = mentors.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Education - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON education
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = education.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Employment - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON employment
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = employment.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Hobbies - Allow public read when user has share_token
CREATE POLICY "Allow public read with share token" ON hobbies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = hobbies.user_id 
    AND user_profiles.share_token IS NOT NULL
  )
);

-- Grant usage to public role (anonymous users)
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT permissions to anonymous users for all restorative record tables
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON introduction TO anon;
GRANT SELECT ON awards TO anon;
GRANT SELECT ON skills TO anon;
GRANT SELECT ON community_engagements TO anon;
GRANT SELECT ON rehab_programs TO anon;
GRANT SELECT ON micro_credentials TO anon;
GRANT SELECT ON mentors TO anon;
GRANT SELECT ON education TO anon;
GRANT SELECT ON employment TO anon;
GRANT SELECT ON hobbies TO anon;

-- Also grant to authenticated users (for completeness)
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON introduction TO authenticated;
GRANT SELECT ON awards TO authenticated;
GRANT SELECT ON skills TO authenticated;
GRANT SELECT ON community_engagements TO authenticated;
GRANT SELECT ON rehab_programs TO authenticated;
GRANT SELECT ON micro_credentials TO authenticated;
GRANT SELECT ON mentors TO authenticated;
GRANT SELECT ON education TO authenticated;
GRANT SELECT ON employment TO authenticated;
GRANT SELECT ON hobbies TO authenticated; 