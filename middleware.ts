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
const protectedRoutes = ['/api/send-email'];

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

  // Generate and set CSRF token for GET requests
  if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });
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
