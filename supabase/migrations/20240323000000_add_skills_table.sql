-- Create skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    soft_skills TEXT[] NOT NULL,
    hard_skills TEXT[] NOT NULL,
    other_skills TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skills"
    ON skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
    ON skills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
    ON skills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
    ON skills FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_skills_user_id ON skills(user_id); 
