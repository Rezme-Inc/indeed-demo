import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// CSRF token generation
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Verify CSRF token
function verifyCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf-token')?.value;
  
  if (!token || !cookieToken || token !== cookieToken) {
    return false;
  }
  
  return true;
}

// Routes that require CSRF protection
const protectedRoutes = ['/api/send-email', '/api/audit/security-event'];

// Routes that are public and don't need authentication
const publicRoutes = [
  '/',
  '/auth/',
  '/restorative-record/share/',
  '/_next/',
  '/api/auth/',
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes and static assets
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return response;
  }

  // Check if this is a route that needs CSRF protection
  const needsCSRF = protectedRoutes.some(route => pathname.startsWith(route)) || 
                    pathname.startsWith('/hr-admin') || 
                    pathname.includes('assessment') ||
                    request.nextUrl.searchParams.has('_csrf_init');

  // Handle CSRF protection for API routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      if (!verifyCSRFToken(request)) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF token verification failed' }),
          { 
            status: 403, 
            headers: { 'content-type': 'application/json' } 
          }
        );
      }
    }
  }

  // Generate and set CSRF token for requests that need it
  const existingToken = request.cookies.get('csrf-token')?.value;
  
  if (request.method === 'GET' && (needsCSRF || !existingToken)) {
    const csrfToken = generateCSRFToken();
    
    // Set httpOnly cookie for server-side verification
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/', // Ensure cookie is available site-wide
    });
    
    // Also set a non-httpOnly cookie that JavaScript can read
    response.cookies.set('csrf-token-js', csrfToken, {
      httpOnly: false, // JavaScript can read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    
    // Add debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CSRF] Set token for ${pathname}, needs CSRF: ${needsCSRF}`);
    }
  }

  // Set secure cookie headers for all responses
  const cookieHeader = response.headers.get('set-cookie');
  if (cookieHeader) {
    // Ensure all cookies are secure and httpOnly where appropriate
    const securedCookies = cookieHeader
      .split(',')
      .map(cookie => {
        if (!cookie.includes('Secure') && process.env.NODE_ENV === 'production') {
          cookie += '; Secure';
        }
        if (!cookie.includes('SameSite')) {
          cookie += '; SameSite=Strict';
        }
        return cookie;
      })
      .join(',');
    
    response.headers.set('set-cookie', securedCookies);
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
