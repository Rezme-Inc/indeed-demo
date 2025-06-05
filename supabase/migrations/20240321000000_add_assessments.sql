-- Create assessment_sessions table
CREATE TABLE assessment_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    hr_admin_id UUID REFERENCES hr_admin_profiles(id) NOT NULL,
    company_id UUID REFERENCES hr_admin_profiles(id) NOT NULL, -- The company the HR admin belongs to
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create assessment_events table to track all interactions
CREATE TABLE assessment_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create assessment_decisions table for final decisions
CREATE TABLE assessment_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_decisions ENABLE ROW LEVEL SECURITY;

-- Assessment sessions policies
CREATE POLICY "HR admins can view their own assessment sessions"
    ON assessment_sessions FOR SELECT
    USING (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can create assessment sessions"
    ON assessment_sessions FOR INSERT
    WITH CHECK (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can update their own assessment sessions"
    ON assessment_sessions FOR UPDATE
    USING (hr_admin_id = auth.uid());

-- Assessment events policies
CREATE POLICY "HR admins can view their own assessment events"
    ON assessment_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessment_sessions
            WHERE id = assessment_events.session_id
            AND hr_admin_id = auth.uid()
        )
    );

CREATE POLICY "HR admins can create assessment events"
    ON assessment_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessment_sessions
            WHERE id = assessment_events.session_id
            AND hr_admin_id = auth.uid()
        )
    );

-- Assessment decisions policies
CREATE POLICY "HR admins can view their own assessment decisions"
    ON assessment_decisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessment_sessions
            WHERE id = assessment_decisions.session_id
            AND hr_admin_id = auth.uid()
        )
    );

CREATE POLICY "HR admins can create assessment decisions"
    ON assessment_decisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessment_sessions
            WHERE id = assessment_decisions.session_id
            AND hr_admin_id = auth.uid()
        )
    );

CREATE POLICY "HR admins can update their own assessment decisions"
    ON assessment_decisions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessment_sessions
            WHERE id = assessment_decisions.session_id
            AND hr_admin_id = auth.uid()
        )
    );

-- Rezme admin policies
CREATE POLICY "Rezme admins can view all assessment data"
    ON assessment_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme admins can view all assessment events"
    ON assessment_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme admins can view all assessment decisions"
    ON assessment_decisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Add updated_at triggers
CREATE TRIGGER update_assessment_sessions_updated_at
    BEFORE UPDATE ON assessment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_decisions_updated_at
    BEFORE UPDATE ON assessment_decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_hr_admin_id ON assessment_sessions(hr_admin_id);
CREATE INDEX idx_assessment_sessions_company_id ON assessment_sessions(company_id);
CREATE INDEX idx_assessment_events_session_id ON assessment_events(session_id);
CREATE INDEX idx_assessment_decisions_session_id ON assessment_decisions(session_id); 
