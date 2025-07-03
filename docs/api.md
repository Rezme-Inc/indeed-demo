# API Documentation

This document details the API endpoints and their usage in Rezme.

## Authentication

All API endpoints require authentication using Supabase Auth. The authentication token should be included in the request headers:

```typescript
headers: {
  'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
}
```

## User Endpoints

### Profile Management

#### Get User Profile

```typescript
GET /user_profiles?id=eq.{user_id}
```

Returns the user's profile information.

#### Update User Profile

```typescript
PATCH /user_profiles?id=eq.{user_id}
```

Updates the user's profile information.

**Request Body:**

```typescript
{
  first_name?: string;
  last_name?: string;
  birthday?: Date;
  interests?: string[];
  is_visible_to_hr?: boolean;
}
```

### HR Connections

#### Get Connected HR Admins

```typescript
GET /hr_admin_profiles?connected_users=cs.{user_id}
```

Returns all HR admins connected to the user.

## HR Admin Endpoints

### Profile Management

#### Get HR Admin Profile

```typescript
GET /hr_admin_profiles?id=eq.{hr_admin_id}
```

Returns the HR admin's profile information.

#### Update HR Admin Profile

```typescript
PATCH /hr_admin_profiles?id=eq.{hr_admin_id}
```

Updates the HR admin's profile information.

**Request Body:**

```typescript
{
  first_name?: string;
  last_name?: string;
  company?: string;
}
```

### User Management

#### Get Connected Users

```typescript
GET /user_profiles?id=in.(select unnest(connected_users) from hr_admin_profiles where id=eq.{hr_admin_id})
```

Returns all users connected to the HR admin.

#### Get Visible Users

```typescript
GET /user_profiles?is_visible_to_hr=eq.true
```

Returns all users who have set their profile to be visible to HR admins.

#### Connect with User

```typescript
PATCH /hr_admin_profiles?id=eq.{hr_admin_id}
```

Adds a user to the HR admin's connected users list.

**Request Body:**

```typescript
{
  connected_users: [...existing_users, new_user_id];
}
```

### Invitation System

#### Generate Invitation Code

```typescript
PATCH /hr_admin_profiles?id=eq.{hr_admin_id}
```

Generates a new invitation code for the HR admin.

**Request Body:**

```typescript
{
  invitation_code: generateRandomCode(); // 8-character alphanumeric code
}
```

#### Verify Invitation Code

```typescript
GET /hr_admin_profiles?invitation_code=eq.{code}
```

Verifies if an invitation code is valid and returns the associated HR admin.

## Rezme Admin Endpoints

### User Management

#### Get All Users

```typescript
GET / user_profiles;
```

Returns all user profiles in the system.

#### Get All HR Admins

```typescript
GET / hr_admin_profiles;
```

Returns all HR admin profiles in the system.

### HR Admin Management

#### Create HR Admin

```typescript
POST / hr_admin_profiles;
```

Creates a new HR admin profile.

**Request Body:**

```typescript
{
  id: string; // UUID from auth.users
  email: string;
  first_name: string;
  last_name: string;
  company: string;
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON object with:

```typescript
{
  error: string;
  message: string;
  details?: any;
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- 100 requests per minute per authenticated user
- 20 requests per minute per IP address for unauthenticated requests

## Best Practices

1. Always handle errors appropriately
2. Use appropriate HTTP methods for operations
3. Include proper authentication headers
4. Validate request data before sending
5. Cache responses when appropriate
6. Use pagination for large result sets
