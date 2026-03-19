import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/constants";
import {
  fetchBackend,
  getBackendAuthHeaders,
  resolveBackendTokens,
} from "@/lib/backend-api";
import { requestSessionRefresh } from "@/lib/auth/refresh";
import type { SessionTokens } from "@/lib/auth/types";
import {
  clearAuthState,
  mirrorBackendAuthCookies,
} from "@/lib/server-response";

const SESSION_VALIDATION_ERROR_MESSAGE =
  "Nao foi possivel validar sua sessao. Entre novamente.";

export interface BackendProxyResult {
  backendResponse: Response;
  fallbackTokens: Partial<SessionTokens>;
  clearAuth: boolean;
}

function buildSessionValidationErrorResponse(status: number) {
  return new Response(
    JSON.stringify({
      status: "error",
      message: SESSION_VALIDATION_ERROR_MESSAGE,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

function upsertCookie(cookieHeader: string, name: string, value: string) {
  const parts = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const prefix = `${name}=`;
  const nextParts = parts.filter((part) => !part.startsWith(prefix));

  nextParts.push(`${name}=${value}`);

  return nextParts.join("; ");
}

function buildRetryCookieHeader(
  request: NextRequest,
  tokens: Partial<SessionTokens>,
) {
  let cookieHeader = request.headers.get("cookie") ?? "";

  if (tokens.token) {
    cookieHeader = upsertCookie(cookieHeader, AUTH_COOKIE_NAME, tokens.token);
  }

  if (tokens.refreshToken) {
    cookieHeader = upsertCookie(
      cookieHeader,
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
    );
  }

  return cookieHeader;
}

function buildBackendHeaders(
  request: NextRequest,
  headersInit?: HeadersInit,
  tokens?: Partial<SessionTokens>,
) {
  const headers = new Headers(headersInit);

  if (tokens) {
    if (tokens.token) {
      headers.set("Authorization", `Bearer ${tokens.token}`);
    }

    const cookieHeader = buildRetryCookieHeader(request, tokens);

    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    } else {
      headers.delete("cookie");
    }

    return headers;
  }

  const authHeaders = getBackendAuthHeaders(request);

  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return headers;
}

export async function fetchBackendWithAutoRefresh(
  request: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<BackendProxyResult> {
  const initialResponse = await fetchBackend(path, {
    ...init,
    headers: buildBackendHeaders(request, init?.headers),
  });

  if (initialResponse.status !== 401) {
    return {
      backendResponse: initialResponse,
      fallbackTokens: {},
      clearAuth: false,
    };
  }

  const { backendResponse: refreshResponse, envelope } =
    await requestSessionRefresh({
      cookieHeader: request.headers.get("cookie") ?? "",
    });

  if (!refreshResponse.ok || envelope.status !== "success") {
    return {
      backendResponse: buildSessionValidationErrorResponse(
        refreshResponse.status || 401,
      ),
      fallbackTokens: {},
      clearAuth: refreshResponse.status === 401,
    };
  }

  const fallbackTokens = resolveBackendTokens(refreshResponse);
  const retriedResponse = await fetchBackend(path, {
    ...init,
    headers: buildBackendHeaders(request, init?.headers, fallbackTokens),
  });

  if (retriedResponse.status === 401) {
    return {
      backendResponse: buildSessionValidationErrorResponse(401),
      fallbackTokens,
      clearAuth: true,
    };
  }

  return {
    backendResponse: retriedResponse,
    fallbackTokens,
    clearAuth: false,
  };
}

export function applyBackendProxyAuth(
  response: NextResponse,
  result: BackendProxyResult,
) {
  mirrorBackendAuthCookies(
    response,
    result.backendResponse,
    result.fallbackTokens,
  );

  if (result.clearAuth) {
    clearAuthState(response);
  }

  return response;
}
