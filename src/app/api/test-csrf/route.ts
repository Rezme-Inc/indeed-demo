import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const csrfToken = request.cookies.get('csrf-token-js')?.value;
  
  return NextResponse.json({
    message: 'CSRF Test Endpoint',
    hasCSRFToken: !!csrfToken,
    csrfTokenLength: csrfToken?.length,
    allCookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token-js')?.value;
  
  return NextResponse.json({
    message: 'CSRF POST Test',
    hasCSRFHeader: !!csrfHeader,
    hasCSRFCookie: !!csrfCookie,
    tokensMatch: csrfHeader === csrfCookie,
    headerLength: csrfHeader?.length,
    cookieLength: csrfCookie?.length,
    timestamp: new Date().toISOString()
  });
} 
