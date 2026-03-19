import type { NextRequest } from "next/server";

import type { SessionTokens } from "@/lib/auth/types";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function parseJsonSafe<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

export async function fetchBackend(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (!headers.has("accept")) {
    headers.set("Accept", "application/json");
  }

  try {
    return await fetch(`${env.BACKEND_API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Backend indisponivel no momento.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export function getBackendSetCookie(response: Response) {
  return response.headers.get("set-cookie");
}

export function extractCookieValue(setCookieHeader: string | null, cookieName: string) {
  if (!setCookieHeader) {
    return null;
  }

  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = setCookieHeader.match(new RegExp(`${escapedName}=([^;]+)`));
  return match?.[1] ?? null;
}

export function resolveBackendToken(response: Response, fallbackToken?: string) {
  return (
    extractCookieValue(getBackendSetCookie(response), AUTH_COOKIE_NAME) ??
    fallbackToken ??
    undefined
  );
}

export function resolveBackendRefreshToken(response: Response, fallbackRefreshToken?: string) {
  return (
    extractCookieValue(getBackendSetCookie(response), REFRESH_COOKIE_NAME) ??
    fallbackRefreshToken ??
    undefined
  );
}

export function resolveBackendTokens(
  response: Response,
  fallbackTokens: Partial<SessionTokens> = {},
) {
  return {
    token: resolveBackendToken(response, fallbackTokens.token),
    refreshToken: resolveBackendRefreshToken(response, fallbackTokens.refreshToken),
  };
}

export function getBackendAuthHeaders(request: NextRequest) {
  const headers: Record<string, string> = {};
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  return headers;
}

function buildHttpOnlyCookie(name: string, value: string, maxAge: number) {
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge,
  };
}

export function buildTokenCookie(token: string) {
  return buildHttpOnlyCookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_MAX_AGE_SECONDS);
}

export function buildRefreshTokenCookie(refreshToken: string) {
  return buildHttpOnlyCookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    AUTH_COOKIE_MAX_AGE_SECONDS,
  );
}

export function buildClearedTokenCookie() {
  return buildHttpOnlyCookie(AUTH_COOKIE_NAME, "", 0);
}

export function buildClearedRefreshTokenCookie() {
  return buildHttpOnlyCookie(REFRESH_COOKIE_NAME, "", 0);
}
