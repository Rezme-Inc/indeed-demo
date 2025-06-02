-- Create rehab_programs table for CRUD-style rehab program entries
CREATE TABLE IF NOT EXISTS public.rehab_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program TEXT NOT NULL,
    program_type TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    details TEXT,
    narrative TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.rehab_programs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rehab programs
CREATE POLICY "Users can view their own rehab programs" ON public.rehab_programs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own rehab programs  
CREATE POLICY "Users can insert their own rehab programs" ON public.rehab_programs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own rehab programs
CREATE POLICY "Users can update their own rehab programs" ON public.rehab_programs
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own rehab programs
CREATE POLICY "Users can delete their own rehab programs" ON public.rehab_programs
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_rehab_programs_user_id ON public.rehab_programs(user_id);
CREATE INDEX idx_rehab_programs_created_at ON public.rehab_programs(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rehab_programs_updated_at
    BEFORE UPDATE ON public.rehab_programs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 