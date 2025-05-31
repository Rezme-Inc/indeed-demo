-- Create awards table
CREATE TABLE awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    date DATE NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for awards
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own awards"
    ON awards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own awards"
    ON awards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own awards"
    ON awards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own awards"
    ON awards FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_awards_updated_at
    BEFORE UPDATE ON awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_awards_user_id ON awards(user_id); 
