# Restorative Records System Documentation

## Overview

The Restorative Records system allows users to create and maintain their restorative record, which includes their personal narrative and introduction. This document outlines the database structure, security measures, and procedures for accessing and managing restorative records.

## Database Structure

### Restorative Records Table

```sql
CREATE TABLE restorative_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    introduction TEXT,
    narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## Security Measures

### Row Level Security (RLS)

The restorative_records table implements Row Level Security with the following policies:

1. Users can only view their own records:

```sql
CREATE POLICY "Users can view their own restorative records"
    ON restorative_records FOR SELECT
    USING (auth.uid() = user_id);
```

2. Users can only insert their own records:

```sql
CREATE POLICY "Users can insert their own restorative records"
    ON restorative_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

3. Users can only update their own records:

```sql
CREATE POLICY "Users can update their own restorative records"
    ON restorative_records FOR UPDATE
    USING (auth.uid() = user_id);
```

## Accessing Restorative Records

### Viewing Records

To view a user's restorative record:

```sql
SELECT
    id,
    user_id,
    introduction,
    narrative,
    created_at,
    updated_at
FROM restorative_records
WHERE user_id = 'specific-user-id';
```

### Creating/Updating Records

To create or update a restorative record:

```sql
INSERT INTO restorative_records (user_id, introduction, narrative)
VALUES ('user-id', 'introduction text', 'narrative text')
ON CONFLICT (user_id)
DO UPDATE SET
    introduction = EXCLUDED.introduction,
    narrative = EXCLUDED.narrative,
    updated_at = NOW();
```

## Integration with User Profiles

The restorative records system integrates with the user_profiles table through the user_id foreign key, ensuring that:

- Each user can only have one restorative record
- Records are properly associated with user accounts
- User authentication is required for all operations

## Audit Trail

The system maintains an audit trail through:

- created_at timestamp
- updated_at timestamp
- Automatic updates via triggers

## Best Practices

1. Always validate user input before saving
2. Ensure proper error handling for database operations
3. Maintain data integrity through foreign key constraints
4. Use appropriate security measures when displaying sensitive information
5. Regularly backup restorative record data

## Support

For questions about restorative records:

1. Contact the system administrator
2. Submit a support ticket
3. Follow the established security protocols
