-- Create conditional_job_offers table to store conditional job offer forms
CREATE TABLE conditional_job_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) NOT NULL,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    hr_admin_id UUID REFERENCES hr_admin_profiles(id) NOT NULL,
    
    -- Form data
    offer_date DATE NOT NULL,
    applicant_name TEXT NOT NULL,
    position TEXT NOT NULL,
    employer TEXT NOT NULL,
    
    -- Status tracking
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent')) DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create compliance_steps table to track completion of compliance process steps
CREATE TABLE compliance_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) NOT NULL,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    hr_admin_id UUID REFERENCES hr_admin_profiles(id) NOT NULL,
    
    -- Compliance step tracking
    conditional_job_offer BOOLEAN DEFAULT FALSE,
    individualized_assessment BOOLEAN DEFAULT FALSE,
    preliminary_job_offer_revocation BOOLEAN DEFAULT FALSE,
    individualized_reassessment BOOLEAN DEFAULT FALSE,
    final_revocation_notice BOOLEAN DEFAULT FALSE,
    decision BOOLEAN DEFAULT FALSE,
    
    -- Document references
    conditional_job_offer_id UUID REFERENCES conditional_job_offers(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure one compliance tracking record per session
    UNIQUE(session_id)
);

-- Add RLS policies
ALTER TABLE conditional_job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_steps ENABLE ROW LEVEL SECURITY;

-- Conditional job offers policies
CREATE POLICY "HR admins can view their own conditional job offers"
    ON conditional_job_offers FOR SELECT
    USING (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can create conditional job offers"
    ON conditional_job_offers FOR INSERT
    WITH CHECK (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can update their own conditional job offers"
    ON conditional_job_offers FOR UPDATE
    USING (hr_admin_id = auth.uid());

-- Compliance steps policies
CREATE POLICY "HR admins can view their own compliance steps"
    ON compliance_steps FOR SELECT
    USING (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can create compliance steps"
    ON compliance_steps FOR INSERT
    WITH CHECK (hr_admin_id = auth.uid());

CREATE POLICY "HR admins can update their own compliance steps"
    ON compliance_steps FOR UPDATE
    USING (hr_admin_id = auth.uid());

-- Rezme admin policies
CREATE POLICY "Rezme admins can view all conditional job offers"
    ON conditional_job_offers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme admins can view all compliance steps"
    ON compliance_steps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Add updated_at triggers
CREATE TRIGGER update_conditional_job_offers_updated_at
    BEFORE UPDATE ON conditional_job_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_steps_updated_at
    BEFORE UPDATE ON compliance_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_conditional_job_offers_session_id ON conditional_job_offers(session_id);
CREATE INDEX idx_conditional_job_offers_user_id ON conditional_job_offers(user_id);
CREATE INDEX idx_conditional_job_offers_hr_admin_id ON conditional_job_offers(hr_admin_id);
CREATE INDEX idx_compliance_steps_session_id ON compliance_steps(session_id);
CREATE INDEX idx_compliance_steps_user_id ON compliance_steps(user_id);
CREATE INDEX idx_compliance_steps_hr_admin_id ON compliance_steps(hr_admin_id);

-- Add function to update compliance steps when conditional job offer is sent
CREATE OR REPLACE FUNCTION update_compliance_step_on_offer_sent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update compliance steps when conditional job offer is sent
    IF NEW.status = 'sent' AND OLD.status = 'draft' THEN
        INSERT INTO compliance_steps (session_id, user_id, hr_admin_id, conditional_job_offer, conditional_job_offer_id)
        VALUES (NEW.session_id, NEW.user_id, NEW.hr_admin_id, TRUE, NEW.id)
        ON CONFLICT (session_id) 
        DO UPDATE SET 
            conditional_job_offer = TRUE,
            conditional_job_offer_id = NEW.id,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update compliance steps
CREATE TRIGGER trigger_update_compliance_on_offer_sent
    AFTER UPDATE ON conditional_job_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_step_on_offer_sent(); 