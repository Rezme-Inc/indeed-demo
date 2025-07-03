# Database Schema

This document details the database structure and relationships in Rezme.

## Tables

### User Profiles

- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT) - User's email address
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `birthday` (DATE) - User's date of birth
- `interests` (TEXT[]) - Array of user's professional interests
- `is_visible_to_hr` (BOOLEAN) - Controls visibility to HR admins
- `created_at` (TIMESTAMP WITH TIME ZONE) - Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Record last update timestamp

### HR Admin Profiles

- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT) - HR admin's email address
- `first_name` (TEXT) - HR admin's first name
- `last_name` (TEXT) - HR admin's last name
- `company` (TEXT) - Company name
- `connected_users` (UUID[]) - Array of connected user IDs
- `invitation_code` (TEXT) - Unique code for user invitations
- `created_at` (TIMESTAMP WITH TIME ZONE) - Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Record last update timestamp

### Rezme Admin Profiles

- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT) - Admin's email address
- `first_name` (TEXT) - Admin's first name
- `last_name` (TEXT) - Admin's last name
- `created_at` (TIMESTAMP WITH TIME ZONE) - Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Record last update timestamp

## Relationships

- All profile tables (`user_profiles`, `hr_admin_profiles`, `rezme_admin_profiles`) are linked to Supabase Auth users through their `id` field
- HR Admin Profiles maintain a many-to-many relationship with User Profiles through the `connected_users` array
- The `is_visible_to_hr` flag in User Profiles controls whether they appear in the HR Admin's visible users list

## Row Level Security (RLS)

The database implements Row Level Security policies to ensure data privacy:

### User Profiles

- Users can only view and edit their own profile
- HR admins can only view profiles of connected users
- Rezme admins can view all user profiles

### HR Admin Profiles

- HR admins can only view and edit their own profile
- Rezme admins can view all HR admin profiles and create new ones

### Rezme Admin Profiles

- Rezme admins can only view and edit their own profile

## Indexes

For better query performance, the following indexes are created:

- `idx_user_profiles_email` on `user_profiles(email)`
- `idx_hr_admin_profiles_email` on `hr_admin_profiles(email)`
- `idx_rezme_admin_profiles_email` on `rezme_admin_profiles(email)`

## Triggers

An `updated_at` trigger is implemented on all tables to automatically update the `updated_at` timestamp whenever a record is modified.
