# Work Opportunity Tax Credit (WOTC) System Documentation

## Overview

The WOTC system is designed to securely collect and store pre-screening survey information for the Work Opportunity Tax Credit program. This document outlines the database structure, security measures, and procedures for accessing sensitive information.

## Database Structure

### WOTC Surveys Table

```sql
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
```

## Security Measures

### Row Level Security (RLS)

The WOTC surveys table implements Row Level Security with the following policies:

1. Users can only view their own surveys:

```sql
CREATE POLICY "Users can view their own WOTC surveys"
    ON wotc_surveys FOR SELECT
    USING (auth.uid() = user_id);
```

2. Users can only insert their own surveys:

```sql
CREATE POLICY "Users can insert their own WOTC surveys"
    ON wotc_surveys FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

3. Users can only update their own surveys:

```sql
CREATE POLICY "Users can update their own WOTC surveys"
    ON wotc_surveys FOR UPDATE
    USING (auth.uid() = user_id);
```

### SSN Security

- SSNs are stored in the database but are never exposed in regular queries
- Access to SSN data is restricted to authorized personnel only
- SSNs are required for WOTC certification but should be handled with extreme care

## Accessing WOTC Data

### Regular Data Access

To view WOTC survey data (excluding SSN):

```sql
SELECT
    id,
    user_id,
    county,
    conditional_cert,
    tanf_9mo,
    vet_snap_3mo,
    -- ... other fields ...
    signature,
    signature_date,
    created_at,
    updated_at
FROM wotc_surveys
WHERE user_id = 'specific-user-id';
```

### SSN Access Procedure

To access SSN data, follow these steps:

1. Ensure you have the necessary authorization level
2. Use the following query with proper authentication:

```sql
SELECT
    id,
    user_id,
    ssn,
    signature,
    signature_date
FROM wotc_surveys
WHERE user_id = 'specific-user-id';
```

### Best Practices for SSN Access

1. Only access SSN data when absolutely necessary for WOTC certification
2. Document the reason for accessing SSN data
3. Use the minimum necessary access level
4. Never store SSN data in logs or export it to unsecured locations
5. Always use secure connections when accessing SSN data

## Integration with User Profiles

The WOTC system integrates with the user_profiles table to pre-populate:

- Full Name (first_name + last_name)
- Street Address (address_line1)
- City, State, ZIP Code (city, state, zip_code)
- Phone Number (phone)
- Date of Birth (birthday)

## Audit Trail

The system maintains an audit trail through:

- created_at timestamp
- updated_at timestamp
- Automatic updates via triggers

## Compliance

This system is designed to comply with:

- WOTC program requirements
- Data privacy regulations
- Security best practices for handling sensitive information

## Support

For questions about WOTC data access or security:

1. Contact the system administrator
2. Submit a support ticket
3. Follow the established security protocols
