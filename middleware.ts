import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveBackendTokens } from "@/lib/backend-api";
import { requestSessionRefresh } from "@/lib/auth/refresh";
import { isTokenExpiredOrNearExpiry } from "@/lib/auth/jwt";
import { APP_ROUTES, AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";
import { clearAuthState, mirrorBackendAuthCookies } from "@/lib/server-response";

const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60;

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

function isPublicAuthPage(pathname: string) {
  return (
    pathname === APP_ROUTES.login ||
    pathname === APP_ROUTES.register ||
    pathname === APP_ROUTES.forgotPassword
  );
}

function isProtectedPage(pathname: string) {
  return (
    pathname.startsWith(APP_ROUTES.profiles) ||
    pathname.startsWith(APP_ROUTES.app) ||
    pathname.startsWith(APP_ROUTES.subscription)
  );
}

function shouldSkipAutomaticRefresh(pathname: string) {
  return pathname.startsWith("/api/auth/");
}

function buildCookieHeader(entries: Iterable<[string, string]>) {
  return Array.from(entries, ([name, value]) => `${name}=${value}`).join("; ");
}

function applyCookieOverridesToRequestHeaders(
  request: NextRequest,
  overrides: Map<string, string | null>,
) {
  const headers = new Headers(request.headers);
  const cookies = new Map(
    request.cookies.getAll().map(({ name, value }) => [name, value] as const),
  );

  overrides.forEach((value, name) => {
    if (value === null) {
      cookies.delete(name);
      return;
    }

    cookies.set(name, value);
  });

  if (cookies.size === 0) {
    headers.delete("cookie");
    return headers;
  }

  headers.set("cookie", buildCookieHeader(cookies.entries()));
  return headers;
}

function buildRequestContinuationResponse(requestHeaders?: Headers) {
  if (!requestHeaders) {
    return NextResponse.next();
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  let isAuthenticated = Boolean(sessionCookie);
  const { pathname } = request.nextUrl;
  let requestHeaders: Headers | undefined;
  let refreshResponse: Response | null = null;
  let shouldClearSession = false;

  if (sessionCookie && !shouldSkipAutomaticRefresh(pathname)) {
    const accessTokenExpired =
      !accessToken ||
      isTokenExpiredOrNearExpiry(accessToken, {
        bufferSeconds: 0,
      });
    const accessTokenNeedsRefresh =
      !accessToken ||
      isTokenExpiredOrNearExpiry(accessToken, {
        bufferSeconds: ACCESS_TOKEN_REFRESH_BUFFER_SECONDS,
      });

    if (refreshToken && accessTokenNeedsRefresh) {
      const { backendResponse, envelope } = await requestSessionRefresh({
        cookieHeader: request.headers.get("cookie") ?? "",
      });

      if (backendResponse.ok && envelope.status === "success") {
        const refreshedTokens = resolveBackendTokens(backendResponse);
        const cookieOverrides = new Map<string, string | null>();

        if (refreshedTokens.token) {
          cookieOverrides.set(AUTH_COOKIE_NAME, refreshedTokens.token);
        }

        if (refreshedTokens.refreshToken) {
          cookieOverrides.set(REFRESH_COOKIE_NAME, refreshedTokens.refreshToken);
        }

        if (cookieOverrides.size > 0) {
          refreshResponse = backendResponse;
          requestHeaders = applyCookieOverridesToRequestHeaders(request, cookieOverrides);
        }
      } else if (backendResponse.status === 401) {
        shouldClearSession = true;
        isAuthenticated = false;
        requestHeaders = applyCookieOverridesToRequestHeaders(
          request,
          new Map([
            [AUTH_COOKIE_NAME, null],
            [REFRESH_COOKIE_NAME, null],
            [SESSION_COOKIE_NAME, null],
          ]),
        );
      }
    } else if (!refreshToken && accessTokenExpired) {
      shouldClearSession = true;
      isAuthenticated = false;
      requestHeaders = applyCookieOverridesToRequestHeaders(
        request,
        new Map([
          [AUTH_COOKIE_NAME, null],
          [REFRESH_COOKIE_NAME, null],
          [SESSION_COOKIE_NAME, null],
        ]),
      );
    }
  }

  let response: NextResponse;

  if (isAuthenticated && isPublicAuthPage(pathname)) {
    response = NextResponse.redirect(new URL(APP_ROUTES.profiles, request.url));
  } else if (!isAuthenticated && isProtectedPage(pathname)) {
    response = NextResponse.redirect(new URL(APP_ROUTES.login, request.url));
  } else {
    response = buildRequestContinuationResponse(requestHeaders);
  }

  if (refreshResponse) {
    mirrorBackendAuthCookies(response, refreshResponse);
  }

  if (shouldClearSession) {
    clearAuthState(response);
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
