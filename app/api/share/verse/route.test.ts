import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_COOKIE_NAME } from "@/lib/constants";

vi.mock("@/lib/auth/session", () => ({
  parseSession: vi.fn(),
}));

vi.mock("@/lib/backend-api", () => ({
  fetchBackend: vi.fn(),
}));

vi.mock("@/lib/server-response", () => ({
  parseBackendEnvelope: vi.fn(),
}));

function createRequest(sessionCookie = "session-cookie") {
  return {
    nextUrl: new URL("https://app.test/api/share/verse?abbrev=gn&chapter=1&verse=1"),
    cookies: {
      get(name: string) {
        if (name !== SESSION_COOKIE_NAME) {
          return undefined;
        }

        return {
          name,
          value: sessionCookie,
        };
      },
    },
  } as unknown as NextRequest;
}

describe("app/api/share/verse route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("bloqueia o compartilhamento para usuarios sem plano pago", async () => {
    const { parseSession } = await import("@/lib/auth/session");
    vi.mocked(parseSession).mockReturnValue({
      family: {
        id: "family-1",
        familyName: "Familia Teste",
        userName: "usuario",
        email: "teste@example.com",
        plan: "free",
        authProvider: "local",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
      },
      profiles: [],
      selectedProfile: null,
    });

    const { fetchBackend } = await import("@/lib/backend-api");
    const { GET } = await import("./route");
    const response = await GET(createRequest());

    expect(fetchBackend).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      message: "O compartilhamento de versiculos esta disponivel apenas no plano pago.",
    });
  });

  it("encaminha o compartilhamento para o backend quando o usuario tem plano pago", async () => {
    const { parseSession } = await import("@/lib/auth/session");
    vi.mocked(parseSession).mockReturnValue({
      family: {
        id: "family-1",
        familyName: "Familia Teste",
        userName: "usuario",
        email: "teste@example.com",
        plan: "paid",
        authProvider: "local",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
      },
      profiles: [],
      selectedProfile: null,
    });

    const { fetchBackend } = await import("@/lib/backend-api");
    const { parseBackendEnvelope } = await import("@/lib/server-response");

    vi.mocked(fetchBackend).mockResolvedValue(
      new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.mocked(parseBackendEnvelope).mockResolvedValue({
      status: "success",
      data: {
        text: "No principio Deus criou os ceus e a terra.",
        book: "Genesis",
        abbrev: "gn",
        chapter: 1,
        verse: 1,
        reference: "Genesis 1:1",
        translation: "nvi",
        socialHandle: "@evangelhoemaudio",
        shareUrl: "https://app.test/share/verse/gn/1/1",
        imageUrl: "https://app.test/api/share/verse/image?abbrev=gn&chapter=1&verse=1&bg=0",
      },
    });

    const { GET } = await import("./route");
    const response = await GET(createRequest());

    expect(fetchBackend).toHaveBeenCalledWith("/share/verse?abbrev=gn&chapter=1&verse=1", {
      method: "GET",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "success",
      data: {
        text: "No principio Deus criou os ceus e a terra.",
        book: "Genesis",
        abbrev: "gn",
        chapter: 1,
        verse: 1,
        reference: "Genesis 1:1",
        translation: "nvi",
        socialHandle: "@evangelhoemaudio",
        shareUrl: "https://app.test/share/verse/gn/1/1",
        imageUrl: "https://app.test/api/share/verse/image?abbrev=gn&chapter=1&verse=1&bg=0",
      },
    });
  });
});
