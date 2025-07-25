-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthday DATE,
    interests TEXT[] DEFAULT '{}',
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    avatar_url TEXT,
    rr_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create hr_admin_profiles table
CREATE TABLE hr_admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT NOT NULL,
    connected_users UUID[] DEFAULT '{}',
    invitation_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create rezme_admin_profiles table
CREATE TABLE rezme_admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_admin_profiles_updated_at
    BEFORE UPDATE ON hr_admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rezme_admin_profiles_updated_at
    BEFORE UPDATE ON rezme_admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rezme_admin_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- HR Admin profiles policies
CREATE POLICY "HR Admins can view their own profile"
    ON hr_admin_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "HR Admins can update their own profile"
    ON hr_admin_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "HR Admins can insert their own profile"
    ON hr_admin_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Add policy to allow users to read HR admin profiles when verifying invitation codes
CREATE POLICY "Users can read HR admin profiles for invitation code verification"
    ON hr_admin_profiles FOR SELECT
    USING (true);

-- Add policy to allow HR admins to view all users but only interact with connected ones
CREATE POLICY "HR Admins can view all users"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hr_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Add policy to allow HR admins to update their connected users
CREATE POLICY "HR Admins can update their connected users"
    ON hr_admin_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Rezme Admin profiles policies
CREATE POLICY "Rezme Admins can view their own profile"
    ON rezme_admin_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Rezme Admins can update their own profile"
    ON rezme_admin_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Rezme Admins can insert their own profile"
    ON rezme_admin_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Rezme Admin access to all users and HR admins
CREATE POLICY "Rezme Admins can view all users"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme Admins can view all HR admins"
    ON hr_admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme Admins can create HR admins"
    ON hr_admin_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_hr_admin_profiles_email ON hr_admin_profiles(email);
CREATE INDEX idx_rezme_admin_profiles_email ON rezme_admin_profiles(email);

-- Enable RLS on assessment tables
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_decisions ENABLE ROW LEVEL SECURITY;

-- Assessment sessions policies
CREATE POLICY "HR Admins can view their own company's sessions"
    ON assessment_sessions FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM hr_admin_profiles
            WHERE company = (
                SELECT company FROM hr_admin_profiles
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "HR Admins can create sessions for their company"
    ON assessment_sessions FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM hr_admin_profiles
            WHERE company = (
                SELECT company FROM hr_admin_profiles
                WHERE id = auth.uid()
            )
        )
    );

-- Assessment events policies
CREATE POLICY "HR Admins can view their company's events"
    ON assessment_events FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM assessment_sessions
            WHERE company_id IN (
                SELECT id FROM hr_admin_profiles
                WHERE company = (
                    SELECT company FROM hr_admin_profiles
                    WHERE id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "HR Admins can create events for their sessions"
    ON assessment_events FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM assessment_sessions
            WHERE company_id IN (
                SELECT id FROM hr_admin_profiles
                WHERE company = (
                    SELECT company FROM hr_admin_profiles
                    WHERE id = auth.uid()
                )
            )
        )
    );

-- Assessment decisions policies
CREATE POLICY "HR Admins can view their company's decisions"
    ON assessment_decisions FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM assessment_sessions
            WHERE company_id IN (
                SELECT id FROM hr_admin_profiles
                WHERE company = (
                    SELECT company FROM hr_admin_profiles
                    WHERE id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "HR Admins can create decisions for their sessions"
    ON assessment_decisions FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM assessment_sessions
            WHERE company_id IN (
                SELECT id FROM hr_admin_profiles
                WHERE company = (
                    SELECT company FROM hr_admin_profiles
                    WHERE id = auth.uid()
                )
            )
        )
    );

-- Rezme Admin access to all assessment data
CREATE POLICY "Rezme Admins can view all assessment data"
    ON assessment_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme Admins can view all assessment events"
    ON assessment_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Rezme Admins can view all assessment decisions"
    ON assessment_decisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    );

-- Create WOTC surveys table
CREATE TABLE wotc_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    ssn TEXT NOT NULL,
    county TEXT NOT NULL,
    conditional_cert BOOLEAN DEFAULT FALSE,
    tanf_9mo BOOLEAN DEFAULT FALSE,
    vet_snap_3mo BOOLEAN DEFAULT FALSE,
    voc_rehab BOOLEAN DEFAULT FALSE,
    ticket_work BOOLEAN DEFAULT FALSE,
    va BOOLEAN DEFAULT FALSE,
    snap_6mo BOOLEAN DEFAULT FALSE,
    snap_3of5 BOOLEAN DEFAULT FALSE,
    felony BOOLEAN DEFAULT FALSE,
    ssi BOOLEAN DEFAULT FALSE,
    vet_unemp_4_6 BOOLEAN DEFAULT FALSE,
    vet_unemp_6 BOOLEAN DEFAULT FALSE,
    vet_disab_discharged BOOLEAN DEFAULT FALSE,
    vet_disab_unemp BOOLEAN DEFAULT FALSE,
    tanf_18mo BOOLEAN DEFAULT FALSE,
    tanf_18mo_since97 BOOLEAN DEFAULT FALSE,
    tanf_limit BOOLEAN DEFAULT FALSE,
    unemp_27wks BOOLEAN DEFAULT FALSE,
    signature TEXT NOT NULL,
    signature_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for WOTC surveys
ALTER TABLE wotc_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WOTC surveys"
    ON wotc_surveys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WOTC surveys"
    ON wotc_surveys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WOTC surveys"
    ON wotc_surveys FOR UPDATE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_wotc_surveys_updated_at
    BEFORE UPDATE ON wotc_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
