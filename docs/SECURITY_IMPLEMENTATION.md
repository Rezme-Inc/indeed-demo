# Security Implementation Guide

graph TD
A[User Request] --> B[Middleware Layer]
B --> C[Security Headers Applied]
B --> D[CSRF Token Checked]
C --> E[Next.js App]
D --> E
E --> F[React Components]
E --> G[API Routes]
F --> H[Auto-escaped JSX]
G --> I[Input Validation]
G --> J[Supabase ORM]
J --> K[Parameterized Queries]
J --> L[RLS Policies]

This document outlines the comprehensive security measures implemented in selfservice

## Overview

The security implementation follows defense-in-depth principles with multiple layers of protection across all user roles:

1. **CSRF Protection**: Token-based validation for state-changing operations
2. **XSS Protection**: Content Security Policy, input validation, and secure headers
3. **SQL Injection Protection**: Parameterized queries via Supabase ORM
4. **Secure Session Management**: Enterprise-grade logout and monitoring for all user types
5. **Cookie Security**: Secure, httpOnly, and sameSite configurations
6. **Role-Based Security**: Tailored security measures for Users, HR Admins, and Rezme Admins
7. **Comprehensive Audit Logging**: Complete security event trail with role context
8. **Rate Limiting**: API endpoint protection against abuse
9. **Input Validation**: Comprehensive sanitization and validation
10. **Security Headers**: Complete HTTP security header suite

### 🛡️ Complete Security Coverage

**All User Types Protected:**

- ✅ **Regular Users**: Secure dashboard with logout and session monitoring
- ✅ **HR Admins**: Secure dashboard and assessment workflow with comprehensive logout
- ✅ **Rezme Admins**: Administrative dashboard with enterprise-grade security

**Production-Ready Security:**

- 🔐 Bank-grade session management
- 📊 Complete audit logging
- 🛡️ CSRF, XSS, and SQL injection protection
- ⚡ Real-time security monitoring
- 🔄 Multi-layer fallback mechanisms

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
- `/api/audit/security-event` - Security audit logging endpoint
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

## Secure Logout Implementation

### Comprehensive Session Management

The secure logout system provides enterprise-grade session management across all user roles:

**Features:**

- **Audit Logging**: All logout events are logged with context and user role
- **Secure Cleanup**: Complete removal of sensitive data
- **Multi-Device Logout**: Option to logout from all devices
- **Session Monitoring**: Automatic session validation for all user types
- **Security Events**: Detection and response to suspicious activity
- **Role-Based Security**: Tailored security measures for each user role

**Implementation Files:**

- `src/lib/secureAuth.ts` - Core secure authentication library
- `src/hooks/useSecureSession.ts` - React hook for session management
- `src/app/api/audit/security-event/route.ts` - Security audit logging
- `src/app/auth/security-logout/page.tsx` - Security logout page

### User Role Security Coverage

**Regular Users:**

- Location: `src/app/user/dashboard/page.tsx`
- Features: Secure logout button, session monitoring, audit logging
- Audit Reason: `user_action`

**HR Admins:**

- Main Dashboard: `src/app/hr-admin/dashboard/page.tsx`
- Assessment Pages: `src/app/hr-admin/dashboard/[userId]/assessment/components/layout/AssessmentHeader.tsx`
- Assessment Workflow: `src/app/hr-admin/dashboard/[userId]/assessment/page.tsx`
- Features: Secure logout throughout workflow, session monitoring during assessments
- Audit Reason: `hr_admin_user_action`

**Rezme Admins:**

- Dashboard: `src/app/rezme-admin/dashboard/page.tsx`
- Layout Protection: `src/app/rezme-admin/layout.tsx`
- Features: Secure logout with admin privileges, session monitoring across all admin pages
- Audit Reason: `rezme_admin_user_action`

**Role-Based Layout Protection:**

- Dynamic Role Layout: `src/app/[role]/dashboard/layout.tsx`
- Supports secure logout for any role-based routing

### Usage Examples

**Basic Secure Logout:**

```typescript
import { secureLogout } from "@/lib/secureAuth";

const handleLogout = async () => {
  const result = await secureLogout({
    auditReason: "user_action",
    redirectTo: "/",
    clearLocalData: true,
  });
};
```

**Session Monitoring Hook:**

```typescript
import { useSecureSession } from "@/hooks/useSecureSession";

function MyComponent() {
  const { performSecureLogout, checkSession } = useSecureSession({
    onSessionExpired: () => console.log("Session expired"),
    onSecurityEvent: (reason) => console.log("Security event:", reason),
  });

  return <button onClick={() => performSecureLogout()}>Logout</button>;
}
```

**Force Security Logout:**

```typescript
import { forceSecurityLogout } from "@/lib/secureAuth";

// For suspicious activity
await forceSecurityLogout("suspicious_activity");
```

## Testing Security Implementation

### CSRF Testing

```bash
# Test CSRF protection
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"Test"}'
# Should return 403 Forbidden
```

### Secure Logout Testing

```bash
# Test audit endpoint CSRF protection
curl -X POST http://localhost:3000/api/audit/security-event \
  -H "Content-Type: application/json" \
  -d '{"event_type":"logout","timestamp":"2024-01-01T00:00:00Z"}'
# Should return 403 Forbidden

# Test with comprehensive security test suite
node scripts/test-security.js
```

### Comprehensive Security Test Suite

A complete security test suite is available in `scripts/test-security.js` that tests:

**CSRF Protection:**

- `/api/send-email` endpoint protection
- `/api/audit/security-event` endpoint protection
- Token validation and rejection of requests without valid tokens

**Rate Limiting:**

- Email API rate limiting (10 requests per minute)
- Audit API rate limiting (20 requests per minute)
- Proper 429 responses when limits exceeded

**Input Validation:**

- HTML injection prevention
- Script tag sanitization
- Content-Type validation
- Request body validation

**HTTP Method Restrictions:**

- Only allowed methods accepted
- 405 responses for unsupported methods

**Session Security:**

- Secure logout audit logging
- Security event validation

**Usage:**

```bash
# Run all security tests
node scripts/test-security.js

# Check build with security implementations
npm run build
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

## Security Implementation Status

### ✅ COMPLETED IMPLEMENTATIONS

**Core Security Measures:**

- ✅ CSRF Protection (Token-based validation with secure cookies)
- ✅ XSS Protection (Comprehensive CSP headers and input validation)
- ✅ SQL Injection Protection (Parameterized queries via Supabase ORM)
- ✅ Secure Cookie Configuration (httpOnly, secure, sameSite)
- ✅ Rate Limiting (API endpoints protected)
- ✅ Security Headers (Complete HTTP security header suite)

**Secure Logout & Session Management:**

- ✅ Regular Users (Dashboard with secure logout)
- ✅ HR Admins (Dashboard and assessment workflow)
- ✅ Rezme Admins (Administrative dashboard)
- ✅ Session Monitoring (All user types)
- ✅ Audit Logging (Complete security event trail)
- ✅ Multi-layer Fallbacks (Graceful degradation)

**Testing & Validation:**

- ✅ Comprehensive Security Test Suite
- ✅ Build Validation
- ✅ CSRF Token Testing
- ✅ Rate Limiting Testing
- ✅ Input Validation Testing

**Production Readiness:**

- ✅ Environment Configuration
- ✅ Security Headers Implementation
- ✅ Error Handling & Logging
- ✅ Maintenance Documentation

### 🎯 SECURITY OBJECTIVES ACHIEVED

1. **Defense in Depth**: Multiple layers of security protection
2. **Role-Based Security**: Tailored security for each user type
3. **Enterprise-Grade Logout**: Bank-level session management
4. **Comprehensive Monitoring**: Real-time security event detection
5. **Audit Compliance**: Complete logging and traceability
6. **Graceful Degradation**: Multiple fallback mechanisms
7. **Developer-Friendly**: Easy-to-use security APIs and hooks

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
