-- Create hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    general_hobby TEXT NOT NULL,
    sports TEXT,
    other_interests TEXT,
    narrative TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hobbies"
    ON hobbies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hobbies"
    ON hobbies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hobbies"
    ON hobbies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hobbies"
    ON hobbies FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON hobbies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX hobbies_user_id_idx ON hobbies(user_id); 
