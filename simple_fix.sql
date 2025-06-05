-- Simple Fix for Shared Restorative Record Access
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS on all tables for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE introduction DISABLE ROW LEVEL SECURITY;
ALTER TABLE awards DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_engagements DISABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE micro_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentors DISABLE ROW LEVEL SECURITY;
ALTER TABLE education DISABLE ROW LEVEL SECURITY;
ALTER TABLE employment DISABLE ROW LEVEL SECURITY;
ALTER TABLE hobbies DISABLE ROW LEVEL SECURITY;

-- Grant broad SELECT permissions to anonymous users for testing
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Also grant to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated; 