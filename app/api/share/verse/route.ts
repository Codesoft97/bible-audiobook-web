import { NextRequest, NextResponse } from "next/server";

import { parseSession } from "@/lib/auth/session";
import { fetchBackend } from "@/lib/backend-api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import type { BibleVerseShareData } from "@/lib/verse-share";
import { PAID_PLAN_SHARE_MESSAGE } from "@/lib/verse-share";
import { parseBackendEnvelope } from "@/lib/server-response";

export async function GET(request: NextRequest) {
  const session = parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (session?.family.plan !== "paid") {
    return NextResponse.json(
      {
        status: "error",
        message: PAID_PLAN_SHARE_MESSAGE,
      },
      {
        status: 403,
      },
    );
  }

  const backendResponse = await fetchBackend(`/share/verse${request.nextUrl.search}`, {
    method: "GET",
  });
  const envelope = await parseBackendEnvelope<BibleVerseShareData>(backendResponse);

  return NextResponse.json(envelope, {
    status: backendResponse.status || 400,
  });
}
