import { NextRequest, NextResponse } from "next/server";

import {
  applyBackendProxyAuth,
  fetchBackendWithAutoRefresh,
} from "@/lib/backend-proxy";
import type { Feedback } from "@/lib/feedbacks";
import { feedbackCreateSchema } from "@/lib/validation";
import { jsonError, parseBackendEnvelope } from "@/lib/server-response";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const validation = feedbackCreateSchema.safeParse(payload);

  if (!validation.success) {
    return jsonError(
      validation.error.issues[0]?.message ?? "Dados invalidos.",
      400,
    );
  }

  const result = await fetchBackendWithAutoRefresh(request, "/feedbacks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });
  const envelope = await parseBackendEnvelope<Feedback>(result.backendResponse);
  const response = NextResponse.json(envelope, {
    status: result.backendResponse.status || 400,
  });

  return applyBackendProxyAuth(response, result);
}
