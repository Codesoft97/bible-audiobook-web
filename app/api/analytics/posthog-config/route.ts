import { NextResponse } from "next/server";

import { getPostHogClientConfig } from "@/lib/posthog-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const config = getPostHogClientConfig();

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
