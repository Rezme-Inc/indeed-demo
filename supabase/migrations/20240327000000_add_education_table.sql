-- Create education table
CREATE TABLE IF NOT EXISTS education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    school_location TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    currently_enrolled BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE,
    grade TEXT,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own education"
    ON education FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education"
    ON education FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
    ON education FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
    ON education FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX education_user_id_idx ON education(user_id); 
