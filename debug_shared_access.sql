-- Debug Shared Access for User b275b1f2-b252-4f31-88a4-8d2bf7818b5e
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if user has a share_token
SELECT id, first_name, last_name, share_token, created_at 
FROM user_profiles 
WHERE id = 'b275b1f2-b252-4f31-88a4-8d2bf7818b5e';

-- 2. Check current RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Check RLS policies on skills table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'skills';

-- 4. Check actual skills data for this user
SELECT id, user_id, soft_skills, hard_skills, created_at
FROM skills 
WHERE user_id = 'b275b1f2-b252-4f31-88a4-8d2bf7818b5e';

-- 5. Specifically check for the mentioned skills entry
SELECT id, user_id, soft_skills, hard_skills, other_skills, narrative, created_at
FROM skills 
WHERE id = '23ec0afe-25e1-416f-947c-24ceccdb9d80';

-- 6. Check awards data
SELECT id, user_id, name, type, organization, created_at
FROM awards 
WHERE user_id = 'b275b1f2-b252-4f31-88a4-8d2bf7818b5e';

-- 7. Check if RLS is actually enabled on these tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'skills', 'awards', 'introduction', 'community_engagements', 'rehab_programs', 'micro_credentials', 'mentors', 'education', 'employment', 'hobbies');

-- 8. Check permissions for anon role
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
AND table_name IN ('user_profiles', 'skills', 'awards', 'introduction');

-- 9. Test if we can query user_profiles with share_token from anon perspective
-- This simulates what the anonymous user would see
SET ROLE anon;
SELECT id, first_name, last_name, share_token 
FROM user_profiles 
WHERE share_token IS NOT NULL 
LIMIT 5;

-- Reset to original role
RESET ROLE; 