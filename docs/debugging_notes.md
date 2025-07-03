# Debugging Notes: CSRF Implementation Troubleshooting

## Overview

This document details the systematic debugging process used to diagnose and fix widespread CSRF token failures in the application. The errors manifested as:

```
csrf.ts:99 CSRF token was not set after initialization request
csrf.ts:111 CSRF token initialization failed after retry
Error sending email: Error: CSRF token not found
```

## Problem Analysis

### Initial Symptoms

1. **Console Errors**: Repeated CSRF initialization failures across all components
2. **API Failures**: Email sending and other POST requests failing due to missing tokens
3. **Client-Side Issues**: `initializeCSRFProtection()` function unable to set tokens

### Root Cause Investigation

The debugging process followed a systematic approach to isolate the problem:

## Step-by-Step Debugging Process

### 1. **Verify Server is Running**

**Command:**

```bash
curl -I http://localhost:3000/
```

**Purpose**: Confirm the Next.js development server is operational

**What to Look For**:

- HTTP/1.1 200 OK response
- Basic Next.js headers (`X-Powered-By: Next.js`)
- Response headers indicating server functionality

**Result**: Server was running but missing expected middleware headers

### 2. **Check for Middleware Execution**

**Command:**

```bash
curl -I http://localhost:3000/ | grep -i middleware
```

**Purpose**: Verify if custom middleware is actually running

**Expected Result**: Should see `X-Middleware-Test: working` header

**Actual Result**: No middleware headers found - indicating middleware wasn't executing

**Key Insight**: This immediately identified that the middleware wasn't running at all

### 3. **Test API Routes Specifically**

**Command:**

```bash
curl -I http://localhost:3000/api/test-csrf
```

**Purpose**: Check if middleware runs on API routes vs regular pages

**Analysis**: Same result - no middleware headers on any routes

### 4. **Examine File Structure**

**Command:**

```bash
ls -la | grep middleware
```

**Purpose**: Verify middleware file exists and location

**Finding**: `middleware.ts` existed in project root

### 5. **Check Next.js Version and Compatibility**

**Command:**

```bash
npx next --version
```

**Purpose**: Ensure middleware is supported in the Next.js version being used

**Result**: Next.js v14.1.0 - middleware fully supported

### 6. **Investigate TypeScript Compilation Issues**

**Command:**

```bash
npx tsc --noEmit middleware.ts
```

**Purpose**: Check if TypeScript compilation errors were preventing middleware execution

**Result**: Multiple compilation errors in Next.js type definitions, but this shouldn't prevent middleware from running

### 7. **Test Build Process**

**Command:**

```bash
npx next build --no-lint
```

**Purpose**: Verify the project builds successfully and middleware is included

**Result**: Build succeeded, no middleware-related errors

### 8. **Clear Next.js Cache**

**Commands:**

```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

**Purpose**: Eliminate cached compilation issues that might prevent middleware loading

**Result**: Still no middleware execution after cache clear

### 9. **Test Cookie Generation Manually**

**Commands:**

```bash
curl -s http://localhost:3000/api/test-csrf -c cookies.txt
cat cookies.txt
```

**Purpose**: Check if any cookies are being set at all

**Result**: Empty cookie file - confirming no middleware execution

### 10. **Identify Configuration Conflicts**

**Investigation**: Examined `next.config.js` and found duplicate security headers

**Finding**: Headers were configured in both `next.config.js` and `middleware.ts`, potentially causing conflicts

**Action**: Removed duplicate headers from `next.config.js`

### 11. **Test Different Middleware Locations**

**Hypothesis**: Middleware location might be incorrect for the project structure

**Test 1 - Root Location**:

```bash
# middleware.ts in project root (original location)
curl -I http://localhost:3000/ | grep middleware
# Result: No headers
```

**Test 2 - Source Directory**:

```bash
# Create src/middleware.js
curl -I http://localhost:3000/ | grep middleware
# Result: x-debug-middleware: YES-FROM-SRC
```

**Key Discovery**: Middleware needed to be in `src/` directory for this project structure!

### 12. **Convert TypeScript to JavaScript**

**Action**: Created `src/middleware.js` instead of `src/middleware.ts`

**Reason**: Eliminate any TypeScript compilation issues

**Test**:

```bash
sleep 5 && curl -I http://localhost:3000/ | grep -i debug
```

**Result**: `x-debug-middleware: YES-FROM-SRC` - Middleware finally working!

### 13. **Verify CSRF Token Generation**

**Commands:**

```bash
# Test token generation
curl -s http://localhost:3000/api/test-csrf -c cookies.txt
cat cookies.txt

# Test token recognition
curl -s http://localhost:3000/api/test-csrf -b cookies.txt | jq '.'
```

**Results**:

```
# cookies.txt
localhost   FALSE   /   FALSE   1751164124   csrf-token-js   kafu89iqaak8k3q1qhuw

# API response
{
  "message": "CSRF Test Endpoint",
  "hasCSRFToken": true,
  "csrfTokenLength": 20,
  "allCookies": [{"name": "csrf-token-js", "hasValue": true}]
}
```

**Success**: CSRF tokens now being generated and recognized!

### 14. **Test CSRF Validation**

**Valid Request**:

```bash
curl -s "http://localhost:3000/api/test-csrf" \
  -H "X-CSRF-Token: kafu89iqaak8k3q1qhuw" \
  -H "Content-Type: application/json" \
  -b cookies.txt -X POST -d '{"test": "data"}' | jq '.'
```

**Result**:

```json
{
  "message": "CSRF POST Test",
  "hasCSRFHeader": true,
  "hasCSRFCookie": true,
  "tokensMatch": true
}
```

**Invalid Request (no token)**:

```bash
curl -s "http://localhost:3000/api/test-csrf" \
  -H "Content-Type: application/json" \
  -X POST -d '{"test": "data"}' | jq '.'
```

**Result**:

```json
{
  "error": "CSRF token validation failed"
}
```

**Perfect**: CSRF validation working correctly!

## Debugging Techniques Used

### 1. **Header Inspection**

**Why Important**: HTTP headers reveal what middleware/server logic is executing

**Commands**:

```bash
# Check all headers
curl -I http://localhost:3000/

# Search for specific headers
curl -I http://localhost:3000/ | grep -i [header-name]

# Check API route headers
curl -I http://localhost:3000/api/[route]
```

**What to Look For**:

- Custom headers (X-Middleware-Test, X-Debug-\*)
- Security headers (X-Frame-Options, CSP, etc.)
- Set-Cookie headers for token generation

### 2. **Cookie Analysis**

**Why Important**: CSRF tokens are stored in cookies; tracking cookie lifecycle is crucial

**Commands**:

```bash
# Save cookies from request
curl -s http://localhost:3000/api/test-csrf -c cookies.txt

# View saved cookies
cat cookies.txt

# Use saved cookies in subsequent requests
curl -s http://localhost:3000/api/test-csrf -b cookies.txt
```

**What to Analyze**:

- Cookie names and values
- Expiration times
- Security flags (HttpOnly, Secure, SameSite)
- Domain and path restrictions

### 3. **API Response Testing**

**Why Important**: API responses reveal server-side state and processing

**Commands**:

```bash
# Test with JSON formatting
curl -s http://localhost:3000/api/test-csrf | jq '.'

# Test different HTTP methods
curl -s -X POST http://localhost:3000/api/test-csrf

# Test with specific headers
curl -s -H "X-CSRF-Token: [token]" -X POST http://localhost:3000/api/test-csrf
```

**What to Check**:

- Response status codes (200, 403, 500)
- Response body content and error messages
- Token validation results

### 4. **Server Log Analysis**

**Why Important**: Server-side logs show middleware execution and internal processing

**What to Monitor**:

```bash
# Development server console output
npm run dev

# Look for specific log patterns:
# "🔥 MIDDLEWARE RUNNING:"
# "🔑 Setting new CSRF token:"
# "✅ CSRF token already exists:"
# "🔒 CSRF Validation:"
# "❌ CSRF validation failed"
```

### 5. **File Structure Verification**

**Why Important**: Next.js has specific file location requirements

**Commands**:

```bash
# Check current structure
ls -la | grep middleware

# Check src directory
ls -la src/ | grep middleware

# Verify file permissions
ls -la middleware.*
```

### 6. **Cache and State Management**

**Why Important**: Cached builds can mask configuration changes

**Commands**:

```bash
# Clear Next.js cache
rm -rf .next

# Kill existing processes
pkill -f "next dev"

# Fresh start
npm run dev
```

### 7. **Progressive Testing**

**Strategy**: Start with simple tests and increase complexity

**Example Progression**:

1. Basic server response (`curl -I /`)
2. Middleware headers (`curl -I / | grep middleware`)
3. Cookie generation (`curl -c cookies.txt /api/test-csrf`)
4. Token validation (`curl -b cookies.txt -H "X-CSRF-Token: ..." /api/test`)

## Key Lessons Learned

### 1. **Middleware Location Matters**

**Issue**: `middleware.ts` in project root didn't execute
**Solution**: Move to `src/middleware.js`
**Lesson**: Next.js app directory structure requires middleware in `src/`

### 2. **TypeScript vs JavaScript**

**Issue**: TypeScript compilation errors might prevent execution
**Solution**: Use JavaScript for middleware to eliminate compilation issues
**Lesson**: When debugging, simplify by removing potential complication layers

### 3. **Configuration Conflicts**

**Issue**: Duplicate security headers in `next.config.js` and middleware
**Solution**: Centralize all headers in middleware only
**Lesson**: Avoid duplicate configurations that can conflict

### 4. **Cookie Configuration**

**Issue**: CSRF tokens need client-side access
**Solution**: `httpOnly: false` for CSRF tokens (different from session cookies)
**Lesson**: Different cookie types have different security requirements

### 5. **Systematic Debugging**

**Approach**: Follow logical progression from basic to complex
**Benefits**: Quickly isolates root cause without getting lost in details
**Lesson**: Don't assume complex causes until basic functionality is verified

## Debugging Toolkit

### Essential Commands

```bash
# Quick middleware check
curl -I http://localhost:3000/ | grep -i middleware

# CSRF token test
curl -s http://localhost:3000/api/test-csrf | jq '.'

# Cookie save and reuse
curl -s http://localhost:3000/api/test-csrf -c cookies.txt -b cookies.txt

# POST with CSRF token
curl -s -X POST http://localhost:3000/api/test-csrf \
  -H "X-CSRF-Token: [token]" \
  -H "Content-Type: application/json" \
  -b cookies.txt -d '{"test": "data"}' | jq '.'

# Server restart with cache clear
pkill -f "next dev" && rm -rf .next && npm run dev
```

### Browser Console Testing

```javascript
// Test CSRF implementation
testCSRF();

// Manual token check
document.cookie;

// Get current token
getCSRFToken();

// Test secure fetch
secureFetch("/api/test-csrf", {
  method: "POST",
  body: JSON.stringify({ test: "data" }),
});
```

> **📖 For complete documentation of testing utilities, see:**  
> [CSRF Testing Utilities](./SECURITY_IMPLEMENTATION.md#csrf-testing-utilities) in the Security Implementation guide

## Common Pitfalls to Avoid

### 1. **Assuming Complex Causes First**

**Wrong**: "The TypeScript compilation must be broken"
**Right**: "Is the middleware even running?"

### 2. **Not Checking Basic Server State**

**Wrong**: Debugging token generation logic
**Right**: Verify server responds and middleware executes

### 3. **Ignoring File Locations**

**Wrong**: Assuming middleware works from any location
**Right**: Verify Next.js-specific file location requirements

### 4. **Not Clearing Caches**

**Wrong**: Making changes and testing immediately
**Right**: Clear `.next` cache after configuration changes

### 5. **Testing Complex Scenarios First**

**Wrong**: Testing full authentication flow
**Right**: Test basic cookie generation first

## Best Practices for Future Debugging

### 1. **Start Simple**

Always begin with the most basic test that could expose the problem

### 2. **Use Systematic Approach**

Follow a logical progression from basic to complex

### 3. **Document Findings**

Keep track of what works and what doesn't

### 4. **Use Multiple Testing Methods**

Combine curl commands, browser testing, and console logs

### 5. **Clear State Between Tests**

Restart servers and clear caches to ensure clean test conditions

### 6. **Test Both Success and Failure Cases**

Verify both that valid requests work AND invalid requests are rejected

This debugging process demonstrates the importance of systematic troubleshooting and not making assumptions about where problems might be. The root cause (middleware location) was much simpler than initially suspected!
