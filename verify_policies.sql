-- Verify RLS Policies for Shared Restorative Record Access
-- Run this in Supabase SQL Editor to check what happened

-- 1. Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'skills', 'awards', 'introduction') 
AND schemaname = 'public';

-- 2. Check what policies exist on skills table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'skills' AND schemaname = 'public';

-- 3. Check what policies exist on user_profiles table  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 4. Check permissions for anon role
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
AND table_name IN ('skills', 'user_profiles')
AND table_schema = 'public';

-- 5. Test direct query as anon user
SET ROLE anon;
SELECT COUNT(*) as user_profiles_count FROM user_profiles WHERE share_token IS NOT NULL;
RESET ROLE; 