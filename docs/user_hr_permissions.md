# User-HR Admin Permissions System Documentation

## Overview

The User-HR Admin Permissions system allows users to control which HR administrators can view their restorative records. This implements a privacy-first approach where users explicitly grant access to specific HR admins rather than having their data visible by default.

## Architecture

### Database Schema

#### 1. **user_hr_permissions** Table

This is the core junction table that manages the many-to-many relationship between users and HR admins.

```sql
CREATE TABLE user_hr_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hr_admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, hr_admin_id)
);
```

**Key Fields:**

- `user_id`: The user granting permission
- `hr_admin_id`: The HR admin receiving permission
- `is_active`: Soft delete flag (false = revoked)
- `granted_at`: When permission was granted
- `revoked_at`: When permission was revoked (if applicable)

#### 2. **Related Tables**

- `user_profiles`: Contains user profile information
- `hr_admin_profiles`: Contains HR admin profile information
- All restorative record tables: `introduction`, `awards`, `skills`, `education`, `employment`, `community_engagements`, `hobbies`, `mentors`, `micro_credentials`, `rehabilitative_programs`

### Row Level Security (RLS) Policies

#### Permission Table Policies

```sql
-- Users can view their own permissions
CREATE POLICY "Users can view their own permissions"
    ON user_hr_permissions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can grant permissions
CREATE POLICY "Users can grant permissions to HR admins"
    ON user_hr_permissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can revoke permissions (soft delete)
CREATE POLICY "Users can revoke permissions (soft delete)"
    ON user_hr_permissions FOR UPDATE
    USING (auth.uid() = user_id);

-- HR admins can view permissions granted to them
CREATE POLICY "HR admins can view permissions granted to them"
    ON user_hr_permissions FOR SELECT
    USING (auth.uid() = hr_admin_id AND is_active = true);
```

#### Restorative Record Access Policies

For each restorative record table, we have policies like:

```sql
CREATE POLICY "HR admins can view [table] for permitted users"
    ON [table_name] FOR SELECT
    USING (
        auth.uid() = user_id OR -- Users can view their own data
        EXISTS (
            SELECT 1 FROM user_hr_permissions uhp
            WHERE uhp.user_id = [table_name].user_id
                AND uhp.hr_admin_id = auth.uid()
                AND uhp.is_active = true
        )
    );
```

This ensures HR admins can only view data for users who have explicitly granted them permission.

## User Flows

### 1. User Granting Permission

**Location:** User Dashboard → HR Access Tab

**Process:**

1. User navigates to their dashboard
2. Clicks on "HR Access" tab
3. Searches for HR admins by name, email, or company
4. Selects HR admins to grant access
5. System creates/updates `user_hr_permissions` record

**Code Flow:**

```typescript
// User grants permission
const { error } = await supabase.from("user_hr_permissions").upsert({
  user_id: user.id,
  hr_admin_id: adminId,
  is_active: true,
  revoked_at: null,
});
```

### 2. User Revoking Permission

**Process:**

1. User unchecks previously selected HR admin
2. System performs soft delete by setting `is_active = false`
3. Sets `revoked_at` timestamp

**Code Flow:**

```typescript
// User revokes permission
const { error } = await supabase
  .from("user_hr_permissions")
  .update({
    is_active: false,
    revoked_at: new Date().toISOString(),
  })
  .eq("user_id", user.id)
  .eq("hr_admin_id", adminId);
```

### 3. HR Admin Viewing Permitted Users

**Location:** HR Admin Dashboard

**Process:**

1. HR admin logs in to their dashboard
2. System queries users who have granted permission
3. Shows list with "View Profile" button for each user

**Code Flow:**

```typescript
// Fetch users who granted permission
const { data: permissions } = await supabase
  .from("user_hr_permissions")
  .select("user_id, granted_at")
  .eq("hr_admin_id", hrAdmin.id)
  .eq("is_active", true);

// Then fetch user profiles
const { data: userProfiles } = await supabase
  .from("user_profiles")
  .select("*")
  .in("id", userIds);
```

### 4. HR Admin Viewing Restorative Record

**Location:** `/hr-admin/dashboard/[userId]`

**Access Control:**

1. System verifies HR admin has active permission
2. If yes, loads all restorative record data
3. Displays in read-only format with tabs

**Security Check:**

```typescript
// Verify permission exists
const { data: permission } = await supabase
  .from("user_hr_permissions")
  .select("*")
  .eq("user_id", params.userId)
  .eq("hr_admin_id", authUser.id)
  .eq("is_active", true)
  .single();

if (!permission) {
  throw new Error("You don't have permission to view this profile");
}
```

## Component Architecture

### 1. HRAdminSelector Component

- **Purpose:** Allows users to search and select HR admins
- **Features:**
  - Real-time search with debouncing
  - Shows HR admin name, email, and company
  - Visual feedback for selected admins
  - Handles permission toggling

### 2. User Dashboard HR Access Tab

- **Purpose:** Management interface for user permissions
- **Features:**
  - Displays HRAdminSelector component
  - Shows count of selected HR admins
  - Saves permissions to database

### 3. HR Admin Dashboard

- **Purpose:** Shows users who granted access
- **Features:**
  - Lists permitted users only
  - Shows when access was granted
  - Provides "View Profile" action
  - Shows RR completion status

### 4. HR Admin User Profile View

- **Purpose:** Read-only view of restorative record
- **Features:**
  - Tabbed interface (Overview, Education, Employment, etc.)
  - No edit capabilities
  - Shows complete restorative record data
  - Professional presentation format

## Security Considerations

### 1. Soft Deletes

- Permissions are never hard deleted
- Maintains audit trail of grants/revokes
- Uses `is_active` flag for current state

### 2. Unique Constraints

- `UNIQUE(user_id, hr_admin_id)` prevents duplicate permissions
- Handles re-granting by updating existing record

### 3. Cascading Deletes

- If user or HR admin is deleted, permissions are automatically removed
- Uses `ON DELETE CASCADE` foreign key constraints

### 4. Time-based Tracking

- `granted_at`: Tracks when permission was granted
- `revoked_at`: Tracks when permission was revoked
- `updated_at`: Tracks last modification

## Migration Path

### From Legacy System

If migrating from the old `connected_users` array system:

```sql
INSERT INTO user_hr_permissions (user_id, hr_admin_id, granted_at, is_active)
SELECT
    unnest(hr.connected_users) as user_id,
    hr.id as hr_admin_id,
    hr.created_at as granted_at,
    true as is_active
FROM hr_admin_profiles hr
WHERE hr.connected_users IS NOT NULL
    AND array_length(hr.connected_users, 1) > 0
ON CONFLICT (user_id, hr_admin_id) DO NOTHING;
```

## Best Practices

### 1. Permission Checks

Always verify permissions before showing data:

```typescript
const hasPermission = await checkUserHRPermission(userId, hrAdminId);
if (!hasPermission) {
  throw new Error("Access denied");
}
```

### 2. Efficient Queries

Use indexed columns for queries:

- `user_id` (indexed)
- `hr_admin_id` (indexed)
- `is_active` (partial index where true)

### 3. User Experience

- Clear indication of who has access
- Easy grant/revoke interface
- Confirmation dialogs for revokes
- Show last access dates

### 4. Compliance

- Maintains audit trail
- User-controlled data sharing
- GDPR-friendly approach
- Clear consent mechanism

## Troubleshooting

### Common Issues

1. **406 Not Acceptable Error**

   - Cause: Missing RLS policies on restorative record tables
   - Solution: Apply HR admin read policies to all RR tables

2. **Duplicate Key Error**

   - Cause: Trying to insert duplicate permission
   - Solution: Check for existing record before insert, update if exists

3. **Empty User List for HR Admin**

   - Cause: No users have granted permission
   - Solution: Share invitation code with users

4. **Auth Session Missing**
   - Cause: Wrong Supabase client usage
   - Solution: Use shared client from `@/lib/supabase`

## Future Enhancements

1. **Permission Types**

   - Add granular permissions (view-only, assessment, etc.)
   - Time-limited permissions

2. **Notifications**

   - Notify HR admins when granted access
   - Notify users of HR admin views

3. **Analytics**

   - Track view frequency
   - Show last viewed date
   - Usage reports

4. **Bulk Operations**
   - Grant/revoke multiple HR admins at once
   - Admin tools for permission management
