import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requestSessionRefresh, hasSessionTokens } from "@/lib/auth/refresh";
import { clearAuthState, jsonError, persistAuthTokens } from "@/lib/server-response";

const schema = z.object({
  refreshToken: z.string().min(1, "Refresh token ausente.").optional(),
});

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = payload === null ? { success: true as const, data: {} } : schema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const { backendResponse, envelope } = await requestSessionRefresh({
    cookieHeader: request.headers.get("cookie") ?? "",
    refreshToken: validation.data.refreshToken,
  });

  if (backendResponse.ok && envelope.status === "success" && !hasSessionTokens(envelope.data)) {
    return jsonError("Atualizacao de sessao concluida sem tokens validos.", 502);
  }

  const response = NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });

  if (backendResponse.ok && envelope.status === "success" && hasSessionTokens(envelope.data)) {
    persistAuthTokens(response, envelope.data);
    return response;
  }

  if (backendResponse.status === 401) {
    clearAuthState(response);
  }

  return response;
}
