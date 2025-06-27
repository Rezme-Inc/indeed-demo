# Security Implementation Guide

This document outlines the comprehensive security measures implemented in Rezme v2.0 to protect against CSRF, XSS, and SQL injection attacks.

## Overview

The security implementation follows defense-in-depth principles with multiple layers of protection:

1. **CSRF Protection**: Token-based validation for state-changing operations
2. **XSS Protection**: Content Security Policy, input validation, and secure headers
3. **SQL Injection Protection**: Parameterized queries via Supabase ORM
4. **Cookie Security**: Secure, httpOnly, and sameSite configurations
5. **Additional Security Headers**: Comprehensive HTTP security headers

## CSRF Protection Implementation

### How It Works

1. **Token Generation**: Middleware generates unique CSRF tokens for each session
2. **Token Storage**: Tokens stored in httpOnly cookies with secure flags
3. **Token Validation**: All state-changing requests must include valid CSRF tokens
4. **Token Verification**: Server validates tokens before processing requests

### Implementation Details

**Middleware Configuration** (`middleware.ts`):

- Generates CSRF tokens automatically
- Validates tokens for POST/PUT/DELETE requests
- Returns 403 Forbidden for invalid tokens
- Applies secure cookie settings

**Client-Side Integration** (`src/lib/csrf.ts`):

- `getCSRFToken()`: Retrieves token from cookie
- `secureFetch()`: Automatically includes CSRF tokens in requests
- `initializeCSRFProtection()`: Ensures tokens are available

**Protected Routes**:

- `/api/send-email` - Email sending endpoint
- Add additional API routes to `protectedRoutes` array in middleware

### Usage Example

```typescript
import { secureFetch } from "@/lib/csrf";

// Secure API call with automatic CSRF protection
const response = await secureFetch("/api/send-email", {
  method: "POST",
  body: JSON.stringify({ to, subject, html }),
});
```

## XSS Protection Implementation

### Content Security Policy (CSP)

Configured in `next.config.js` with restrictive policies:

```javascript
"default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' wss: https:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'";
```

### Security Headers

Multiple security headers configured:

- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables browser XSS filtering
- **X-Frame-Options**: Prevents clickjacking attacks
- **Strict-Transport-Security**: Forces HTTPS connections
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Restricts dangerous browser features

### Input Validation

**API Route Protection** (`src/app/api/send-email/route.ts`):

- Content-Type validation
- Input sanitization
- HTML injection prevention
- Length limitations

## SQL Injection Protection

### Supabase ORM Protection

All database operations use Supabase's client library which provides:

- **Parameterized Queries**: Automatic query parameterization
- **Type Safety**: TypeScript ensures query safety
- **Row Level Security**: Database-level access control

### Safe Database Operations

**Utility Function** (`src/lib/supabase.ts`):

```typescript
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  // Safely handles database operations with error management
}
```

### Row Level Security (RLS)

Comprehensive RLS policies implemented:

- **User Data Isolation**: Users can only access their own data
- **HR Admin Restrictions**: Scoped access to permitted users
- **Anonymous Access Control**: Controlled public access with tokens

## Cookie Security Configuration

### Secure Cookie Settings

Configured in middleware for optimal security:

```typescript
response.cookies.set("csrf-token", csrfToken, {
  httpOnly: true, // Prevent XSS access
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 60 * 60 * 24, // 24 hours
});
```

### Supabase Authentication Cookies

Enhanced configuration for auth cookies:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // More secure auth flow
  },
});
```

## Rate Limiting

### API Rate Limiting

Implemented in API routes:

- **10 requests per minute** per IP address
- **In-memory storage** for development
- **Redis recommended** for production

### Implementation

```typescript
function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60000
): boolean {
  // Rate limiting logic
}
```

## Monitoring and Logging

### Security Event Logging

- **Failed Authentication**: Logged with user context
- **CSRF Violations**: Logged with IP and request details
- **Rate Limit Exceeded**: Logged with client information
- **Input Validation Failures**: Logged with sanitized inputs

### Error Handling

- **Generic Error Messages**: Don't expose internal details
- **Detailed Logging**: Full context for debugging
- **Error Categorization**: Security vs. operational errors

## Production Security Checklist

### Environment Variables

Ensure these are set in production:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_from_email
NEXT_PUBLIC_SITE_DOMAIN=your_domain.com
```

### Security Headers Verification

Test headers using tools like:

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

### HTTPS Configuration

Ensure HTTPS is enforced:

- Configure SSL certificates
- Set up HSTS headers
- Redirect HTTP to HTTPS

## Maintenance and Updates

### Regular Security Tasks

1. **Update Dependencies**: Monthly security updates
2. **Review CSP**: Quarterly CSP policy review
3. **Audit Logs**: Weekly security log review
4. **Token Rotation**: Implement token rotation policies

### Security Monitoring

Monitor for:

- Unusual request patterns
- Failed authentication attempts
- CSRF token violations
- Rate limit exceedances

### Incident Response

1. **Immediate Response**: Block suspicious IPs
2. **Investigation**: Analyze logs for attack patterns
3. **Communication**: Notify stakeholders of security events
4. **Recovery**: Implement additional protections as needed

## Testing Security Implementation

### CSRF Testing

```bash
# Test CSRF protection
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"Test"}'
# Should return 403 Forbidden
```

### XSS Testing

```javascript
// Test input sanitization
const maliciousInput = '<script>alert("XSS")</script>';
// Should be sanitized or rejected
```

### Rate Limiting Testing

```bash
# Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/send-email
done
# Should return 429 after 10 requests
```

## Additional Recommendations

### Future Enhancements

1. **Two-Factor Authentication**: Implement 2FA for admin accounts
2. **IP Whitelisting**: Restrict admin access to known IPs
3. **Advanced Monitoring**: Implement security information and event management (SIEM)
4. **Penetration Testing**: Regular security assessments

### Security Best Practices

1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Defense in Depth**: Multiple layers of security
3. **Regular Updates**: Keep all dependencies current
4. **Security Training**: Educate development team on security practices

## Support and Resources

### Internal Resources

- Security team contact: security@rezme.app
- Documentation: `/docs/security.md`
- Incident response plan: `/docs/incident-response.md`

### External Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
