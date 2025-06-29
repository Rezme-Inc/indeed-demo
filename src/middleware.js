import { NextResponse } from "next/server";

export function middleware(request) {
  console.log(
    "🔥 MIDDLEWARE RUNNING:",
    request.method,
    request.nextUrl.pathname
  );

  const response = NextResponse.next();

  // Add comprehensive security headers
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' wss: https:; " +
      "frame-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none'"
  );

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Add test header to verify middleware is working
  response.headers.set("X-Middleware-Test", "working");

  // CSRF Token Generation - for all GET requests
  if (request.method === "GET") {
    const existingToken = request.cookies.get("csrf-token-js")?.value;

    if (!existingToken) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      console.log("🔑 Setting new CSRF token:", token.substring(0, 8) + "...");

      response.cookies.set("csrf-token-js", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    } else {
      console.log(
        "✅ CSRF token already exists:",
        existingToken.substring(0, 8) + "..."
      );
    }
  }

  // CSRF Token Validation for state-changing requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const csrfHeader = request.headers.get("X-CSRF-Token");
    const csrfCookie = request.cookies.get("csrf-token-js")?.value;

    console.log("🔒 CSRF Validation:", {
      method: request.method,
      path: request.nextUrl.pathname,
      hasHeader: !!csrfHeader,
      hasCookie: !!csrfCookie,
      headerValue: csrfHeader?.substring(0, 8) + "...",
      cookieValue: csrfCookie?.substring(0, 8) + "...",
    });

    // Skip CSRF validation for certain paths
    const skipPaths = ["/api/auth", "/auth"];
    const shouldSkip = skipPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (
      !shouldSkip &&
      (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie)
    ) {
      console.log("❌ CSRF validation failed");
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
