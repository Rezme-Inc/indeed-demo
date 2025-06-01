-- Create community_engagements table
CREATE TABLE community_engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL,
    role TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    organization_website TEXT,
    details TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for community engagements
ALTER TABLE community_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own community engagements"
    ON community_engagements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own community engagements"
    ON community_engagements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community engagements"
    ON community_engagements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community engagements"
    ON community_engagements FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_community_engagements_updated_at
    BEFORE UPDATE ON community_engagements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_community_engagements_user_id ON community_engagements(user_id); 
