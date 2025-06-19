-- Fix RLS policies for assessment tracking tables
-- This ensures HR admins can access the tables without breaking authentication

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "HR admins can view their sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "HR admins can create sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "HR admins can update their sessions" ON assessment_sessions;

DROP POLICY IF EXISTS "HR admins can view steps" ON assessment_steps;
DROP POLICY IF EXISTS "HR admins can create steps" ON assessment_steps;

DROP POLICY IF EXISTS "HR admins can view documents" ON assessment_documents;
DROP POLICY IF EXISTS "HR admins can create documents" ON assessment_documents;

DROP POLICY IF EXISTS "HR admins can view audit logs" ON assessment_audit_log;
DROP POLICY IF EXISTS "HR admins can create audit logs" ON assessment_audit_log;

-- Enable RLS on all tables
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_audit_log ENABLE ROW LEVEL SECURITY;

-- Assessment Sessions Policies
-- Allow HR admins to see all sessions (for testing, restrict later)
CREATE POLICY "HR admins can view sessions"
ON assessment_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hr_admin_profiles
    WHERE hr_admin_profiles.id = auth.uid()
  )
);

-- Allow HR admins to create their own sessions
CREATE POLICY "HR admins can create sessions"
ON assessment_sessions FOR INSERT
TO authenticated
WITH CHECK (
  hr_admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM hr_admin_profiles
    WHERE hr_admin_profiles.id = auth.uid()
  )
);

-- Allow HR admins to update their own sessions
CREATE POLICY "HR admins can update sessions"
ON assessment_sessions FOR UPDATE
TO authenticated
USING (hr_admin_id = auth.uid())
WITH CHECK (hr_admin_id = auth.uid());

-- Assessment Steps Policies
-- Allow viewing steps for sessions the HR admin owns
CREATE POLICY "HR admins can view steps"
ON assessment_steps FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessment_sessions
    WHERE assessment_sessions.id = assessment_steps.session_id
    AND assessment_sessions.hr_admin_id = auth.uid()
  )
);

-- Allow creating steps for sessions the HR admin owns
CREATE POLICY "HR admins can create steps"
ON assessment_steps FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessment_sessions
    WHERE assessment_sessions.id = session_id
    AND assessment_sessions.hr_admin_id = auth.uid()
  )
);

-- Assessment Documents Policies
-- Allow viewing documents for sessions the HR admin owns
CREATE POLICY "HR admins can view documents"
ON assessment_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessment_sessions
    WHERE assessment_sessions.id = assessment_documents.session_id
    AND assessment_sessions.hr_admin_id = auth.uid()
  )
);

-- Allow creating documents for sessions the HR admin owns
CREATE POLICY "HR admins can create documents"
ON assessment_documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessment_sessions
    WHERE assessment_sessions.id = session_id
    AND assessment_sessions.hr_admin_id = auth.uid()
  )
);

-- Assessment Audit Log Policies
-- Allow HR admins to view their own audit logs
CREATE POLICY "HR admins can view audit logs"
ON assessment_audit_log FOR SELECT
TO authenticated
USING (hr_admin_id = auth.uid());

-- Allow creating audit logs for authenticated HR admins
CREATE POLICY "HR admins can create audit logs"
ON assessment_audit_log FOR INSERT
TO authenticated
WITH CHECK (
  hr_admin_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM hr_admin_profiles
    WHERE hr_admin_profiles.id = auth.uid()
  )
);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON assessment_sessions TO authenticated;
GRANT SELECT, INSERT ON assessment_steps TO authenticated;
GRANT SELECT, INSERT ON assessment_documents TO authenticated;
GRANT SELECT, INSERT ON assessment_audit_log TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_hr_admin ON assessment_sessions(hr_admin_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_candidate ON assessment_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_steps_session ON assessment_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_documents_session ON assessment_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_audit_log_hr_admin ON assessment_audit_log(hr_admin_id); 
