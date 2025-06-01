-- Create employment table
CREATE TABLE IF NOT EXISTS employment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    currently_employed BOOLEAN DEFAULT FALSE,
    incarcerated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE employment ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own employment"
    ON employment FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employment"
    ON employment FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employment"
    ON employment FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employment"
    ON employment FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON employment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX employment_user_id_idx ON employment(user_id); 
