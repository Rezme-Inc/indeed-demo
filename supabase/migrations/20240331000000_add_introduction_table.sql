-- Create introduction table
CREATE TABLE IF NOT EXISTS introduction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    facebook_url TEXT,
    linkedin_url TEXT,
    reddit_url TEXT,
    digital_portfolio_url TEXT,
    instagram_url TEXT,
    github_url TEXT,
    tiktok_url TEXT,
    pinterest_url TEXT,
    twitter_url TEXT,
    personal_website_url TEXT,
    handshake_url TEXT,
    preferred_occupation TEXT,
    personal_narrative TEXT,
    language_proficiency TEXT CHECK (language_proficiency IN (
        'Bilingual',
        'Advanced Proficiency',
        'Intermediate Proficiency',
        'Basic Proficiency',
        'Limited Proficiency',
        'No Proficiency'
    )),
    other_languages TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE introduction ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own introduction"
    ON introduction FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own introduction"
    ON introduction FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own introduction"
    ON introduction FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own introduction"
    ON introduction FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_introduction_updated_at
    BEFORE UPDATE ON introduction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS introduction_user_id_idx ON introduction(user_id); 
