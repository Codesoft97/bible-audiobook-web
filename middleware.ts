import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_ROUTES, SESSION_COOKIE_NAME } from "@/lib/constants";

function buildCsp() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://accounts.google.com https://*.google.com https://*.gstatic.com",
    "frame-src https://accounts.google.com https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", buildCsp());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  );
  return response;
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionCookie);
  const { pathname } = request.nextUrl;

  if (
    isAuthenticated &&
    (pathname === APP_ROUTES.login ||
      pathname === APP_ROUTES.register ||
      pathname === APP_ROUTES.forgotPassword)
  ) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(APP_ROUTES.profiles, request.url)),
    );
  }

  if (!isAuthenticated && (pathname.startsWith(APP_ROUTES.profiles) || pathname.startsWith(APP_ROUTES.app))) {
    return applySecurityHeaders(NextResponse.redirect(new URL(APP_ROUTES.login, request.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
