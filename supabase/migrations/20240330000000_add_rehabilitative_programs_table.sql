-- Create rehabilitative_programs table
CREATE TABLE IF NOT EXISTS rehabilitative_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    substance_use_disorder BOOLEAN DEFAULT FALSE,
    substance_use_disorder_details TEXT,
    womens_justice_centers BOOLEAN DEFAULT FALSE,
    womens_justice_centers_details TEXT,
    employment_focused BOOLEAN DEFAULT FALSE,
    employment_focused_details TEXT,
    adaptable_justice BOOLEAN DEFAULT FALSE,
    adaptable_justice_details TEXT,
    life_skills_training BOOLEAN DEFAULT FALSE,
    life_skills_training_details TEXT,
    community_service BOOLEAN DEFAULT FALSE,
    community_service_details TEXT,
    family_reintegration BOOLEAN DEFAULT FALSE,
    family_reintegration_details TEXT,
    parenting_classes BOOLEAN DEFAULT FALSE,
    parenting_classes_details TEXT,
    mental_wellness BOOLEAN DEFAULT FALSE,
    mental_wellness_details TEXT,
    faith_based BOOLEAN DEFAULT FALSE,
    faith_based_details TEXT,
    peer_support BOOLEAN DEFAULT FALSE,
    peer_support_details TEXT,
    arts_recreation BOOLEAN DEFAULT FALSE,
    arts_recreation_details TEXT,
    housing_assistance BOOLEAN DEFAULT FALSE,
    housing_assistance_details TEXT,
    legal_compliance BOOLEAN DEFAULT FALSE,
    legal_compliance_details TEXT,
    civic_engagement BOOLEAN DEFAULT FALSE,
    civic_engagement_details TEXT,
    veterans_services BOOLEAN DEFAULT FALSE,
    veterans_services_details TEXT,
    domestic_violence_reduction BOOLEAN DEFAULT FALSE,
    domestic_violence_reduction_details TEXT,
    sex_offender_treatment BOOLEAN DEFAULT FALSE,
    sex_offender_treatment_details TEXT,
    medical_health_care BOOLEAN DEFAULT FALSE,
    medical_health_care_details TEXT,
    other BOOLEAN DEFAULT FALSE,
    other_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE rehabilitative_programs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rehabilitative programs"
    ON rehabilitative_programs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rehabilitative programs"
    ON rehabilitative_programs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rehabilitative programs"
    ON rehabilitative_programs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rehabilitative programs"
    ON rehabilitative_programs FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON rehabilitative_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX rehabilitative_programs_user_id_idx ON rehabilitative_programs(user_id); 
