# Security Documentation

This document outlines the security measures and best practices implemented in Rezme.

## Authentication

### Supabase Auth

- Email/password authentication
- JWT-based session management
- Secure password hashing
- Email verification required for new accounts

### Session Management

- Short-lived access tokens (1 hour)
- Refresh token rotation
- Automatic session invalidation on security events
- Secure cookie handling

## Authorization

### Row Level Security (RLS)

All database tables implement Row Level Security policies to ensure data privacy:

#### User Profiles

```sql
-- Users can only view and edit their own profile
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);
```

#### HR Admin Profiles

```sql
-- HR admins can only view and edit their own profile
CREATE POLICY "HR Admins can view their own profile"
    ON hr_admin_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "HR Admins can update their own profile"
    ON hr_admin_profiles FOR UPDATE
    USING (auth.uid() = id);
```

#### Rezme Admin Profiles

```sql
-- Rezme admins can only view and edit their own profile
CREATE POLICY "Rezme Admins can view their own profile"
    ON rezme_admin_profiles FOR SELECT
    USING (auth.uid() = id);
```

## Data Protection

### Personal Information

- Email addresses are stored securely
- Names are stored as plain text (required for functionality)
- Birthday is optional and stored as DATE type
- Interests are stored as an array of strings

### Visibility Control

- Users control their visibility to HR admins
- HR admins can only see profiles of connected users
- Rezme admins have full access to all profiles

## API Security

### Rate Limiting

- 100 requests per minute per authenticated user
- 20 requests per minute per IP address for unauthenticated requests
- Prevents brute force attacks and abuse

### Input Validation

- All user inputs are validated server-side
- SQL injection prevention through parameterized queries
- XSS prevention through proper escaping
- CSRF protection through tokens

### Error Handling

- Generic error messages for security-related errors
- Detailed logging for debugging
- No sensitive information in error responses

## Best Practices

### Password Security

1. Minimum 8 characters
2. Require mix of uppercase, lowercase, numbers, and symbols
3. Password strength indicator
4. Rate limiting on failed login attempts
5. Secure password reset flow

### Data Access

1. Principle of least privilege
2. Regular access reviews
3. Audit logging for sensitive operations
4. Data retention policies

### Development

1. Regular security updates
2. Dependency vulnerability scanning
3. Code security reviews
4. Secure development practices

### Monitoring

1. Real-time security monitoring
2. Suspicious activity detection
3. Automated alerts for security events
4. Regular security audits

## Compliance

### GDPR Compliance

- Data minimization
- User consent management
- Right to be forgotten
- Data portability
- Privacy by design

### Data Retention

- User data is retained until account deletion
- HR admin data is retained for 1 year after last activity
- Audit logs are retained for 6 months

## Incident Response

### Security Incidents

1. Immediate incident assessment
2. Containment of affected systems
3. Investigation and root cause analysis
4. Remediation and recovery
5. Post-incident review

### Reporting

- Security@rezme.com for security concerns
- Bug bounty program for responsible disclosure
- Regular security status reports

## Recommendations

### For Users

1. Use strong, unique passwords
2. Enable two-factor authentication
3. Regularly review connected HR admins
4. Keep profile information up to date
5. Report suspicious activity

### For HR Admins

1. Secure invitation code management
2. Regular review of connected users
3. Prompt response to security incidents
4. Follow company security policies

### For Developers

1. Follow secure coding practices
2. Regular security training
3. Keep dependencies updated
4. Implement security testing
5. Document security decisions
