-- Create new assessment tables for the updated assessment flow

-- Main assessments table to track assessment progress
CREATE TABLE assessments_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hr_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    current_step INTEGER DEFAULT 1,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'hired', 'revoked')),
    completed_at_step INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(hr_id, candidate_id)
);

-- Assessment steps table to store step-specific data
CREATE TABLE assessment_steps_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hr_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    step_data JSONB NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(hr_id, candidate_id, step_number)
);

-- Assessment documents table for storing generated documents
CREATE TABLE assessment_documents_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hr_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('offer_letter', 'assessment', 'revocation_notice', 'reassessment', 'final_revocation')),
    document_data JSONB NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_assessments_new_hr_candidate ON assessments_new(hr_id, candidate_id);
CREATE INDEX idx_assessment_steps_new_hr_candidate_step ON assessment_steps_new(hr_id, candidate_id, step_number);
CREATE INDEX idx_assessment_documents_new_hr_candidate ON assessment_documents_new(hr_id, candidate_id);

-- Add updated_at trigger for assessments_new
CREATE TRIGGER update_assessments_new_updated_at
    BEFORE UPDATE ON assessments_new
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (but no policies yet since these are _new tables for testing)
ALTER TABLE assessments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_steps_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_documents_new ENABLE ROW LEVEL SECURITY;

-- Add permissive policies for now (to be tightened later)
CREATE POLICY "Allow all operations on assessments_new" ON assessments_new FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on assessment_steps_new" ON assessment_steps_new FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on assessment_documents_new" ON assessment_documents_new FOR ALL USING (true) WITH CHECK (true); 
