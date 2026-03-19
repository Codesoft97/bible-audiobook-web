import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";

function createRequest(cookieHeader: string) {
  const cookies = new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.split("=");
        return [name, rest.join("=")];
      }),
  );

  return {
    headers: new Headers(
      cookieHeader
        ? {
            cookie: cookieHeader,
          }
        : undefined,
    ),
    cookies: {
      get(name: string) {
        const value = cookies.get(name);
        return value ? { name, value } : undefined;
      },
    },
  };
}

describe("backend proxy auto refresh", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.env.BACKEND_API_URL = "https://backend.test";
    process.env.SESSION_SECRET = "test-secret";
  });

  it("retries the backend request with refreshed tokens after a 401", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "error",
            message: "jwt expired",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "success",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "set-cookie":
                "token=new-token; Path=/; HttpOnly, refreshToken=new-refresh; Path=/; HttpOnly",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "success",
            data: [{ id: "sub-1" }],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const request = createRequest(
      "token=old-token; refreshToken=old-refresh; familyId=family-1",
    );
    const { fetchBackendWithAutoRefresh } = await import("@/lib/backend-proxy");

    const result = await fetchBackendWithAutoRefresh(
      request as unknown as NextRequest,
      "/whatsapp/audiobooks",
      {
        method: "GET",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://backend.test/whatsapp/audiobooks",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://backend.test/auth/refresh");
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      "https://backend.test/whatsapp/audiobooks",
    );

    const firstHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(firstHeaders.get("Authorization")).toBe("Bearer old-token");
    expect(firstHeaders.get("cookie")).toContain("token=old-token");
    expect(firstHeaders.get("cookie")).toContain("refreshToken=old-refresh");

    const retryHeaders = new Headers(fetchMock.mock.calls[2]?.[1]?.headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
    expect(retryHeaders.get("cookie")).toContain("token=new-token");
    expect(retryHeaders.get("cookie")).toContain("refreshToken=new-refresh");
    expect(retryHeaders.get("cookie")).toContain("familyId=family-1");

    expect(result.fallbackTokens).toEqual({
      token: "new-token",
      refreshToken: "new-refresh",
    });
    expect(result.clearAuth).toBe(false);
    await expect(result.backendResponse.json()).resolves.toEqual({
      status: "success",
      data: [{ id: "sub-1" }],
    });
  });

  it("returns a sanitized response when refresh fails", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "error",
            message: "jwt expired",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "error",
            message: "refresh expired",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const request = createRequest("token=old-token; refreshToken=old-refresh");
    const { fetchBackendWithAutoRefresh } = await import("@/lib/backend-proxy");

    const result = await fetchBackendWithAutoRefresh(
      request as unknown as NextRequest,
      "/whatsapp/audiobooks",
      {
        method: "GET",
      },
    );

    expect(result.clearAuth).toBe(true);
    expect(result.fallbackTokens).toEqual({});
    expect(result.backendResponse.status).toBe(401);
    await expect(result.backendResponse.json()).resolves.toEqual({
      status: "error",
      message: "Nao foi possivel validar sua sessao. Entre novamente.",
    });
  });

  it("persists refreshed tokens on the next response", async () => {
    const { applyBackendProxyAuth } = await import("@/lib/backend-proxy");

    const response = NextResponse.json({
      status: "success",
    });

    applyBackendProxyAuth(response, {
      backendResponse: new Response(null, { status: 200 }),
      fallbackTokens: {
        token: "new-token",
        refreshToken: "new-refresh",
      },
      clearAuth: false,
    });

    expect(response.cookies.get(AUTH_COOKIE_NAME)?.value).toBe("new-token");
    expect(response.cookies.get(REFRESH_COOKIE_NAME)?.value).toBe("new-refresh");
  });
});
