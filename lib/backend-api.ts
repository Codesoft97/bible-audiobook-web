import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

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
  try {
    return await fetch(`${env.BACKEND_API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
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
  if (fallbackToken) {
    return fallbackToken;
  }

  return extractCookieValue(getBackendSetCookie(response), AUTH_COOKIE_NAME);
}

export function getBackendAuthHeaders(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  const cookieHeader = request.headers.get("cookie") ?? "";

  return cookieHeader
    ? {
        cookie: cookieHeader,
      }
    : {};
}

export function buildTokenCookie(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function buildClearedTokenCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.IS_PRODUCTION,
    path: "/",
    maxAge: 0,
  };
}
