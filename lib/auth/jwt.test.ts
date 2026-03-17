import { describe, expect, it } from "vitest";

import {
  getTokenExpirationTime,
  isTokenExpiredOrNearExpiry,
  parseJwtPayload,
} from "@/lib/auth/jwt";

function encodeBase64Url(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createJwt(payload: Record<string, unknown>) {
  return `${encodeBase64Url({ alg: "HS256", typ: "JWT" })}.${encodeBase64Url(payload)}.signature`;
}

describe("jwt helpers", () => {
  it("extrai o payload e a expiracao de um JWT valido", () => {
    const token = createJwt({ sub: "family-1", exp: 1_800_000_000 });

    expect(parseJwtPayload(token)).toMatchObject({
      sub: "family-1",
      exp: 1_800_000_000,
    });
    expect(getTokenExpirationTime(token)).toBe(1_800_000_000);
  });

  it("considera o token proximo da expiracao dentro da margem configurada", () => {
    const now = Date.UTC(2026, 2, 17, 18, 0, 0);
    const token = createJwt({
      exp: Math.floor((now + 45_000) / 1000),
    });

    expect(
      isTokenExpiredOrNearExpiry(token, {
        now,
        bufferSeconds: 60,
      }),
    ).toBe(true);
    expect(
      isTokenExpiredOrNearExpiry(token, {
        now,
        bufferSeconds: 30,
      }),
    ).toBe(false);
  });

  it("trata tokens invalidos como expirados", () => {
    expect(isTokenExpiredOrNearExpiry("token-invalido")).toBe(true);
    expect(getTokenExpirationTime("token-invalido")).toBeNull();
    expect(parseJwtPayload("token-invalido")).toBeNull();
  });
});
