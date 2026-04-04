import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import type { Family } from "@/lib/auth/types";
import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { persistSession } from "@/lib/session-response";
import {
  jsonError,
  parseBackendEnvelope,
} from "@/lib/server-response";
import { legalConsentSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = legalConsentSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(validation.error.issues[0]?.message ?? "Dados invalidos.", 400);
  }

  const result = await fetchBackendWithAutoRefresh(request, "/families/me/legal-consent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });
  const envelope = await parseBackendEnvelope<Family>(result.backendResponse);
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 200,
  });
  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (
    session &&
    result.backendResponse.ok &&
    envelope.status === "success" &&
    envelope.data
  ) {
    persistSession(response, {
      ...session,
      family: envelope.data,
    });
  }

  return applyBackendProxyAuth(response, result);
}
