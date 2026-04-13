import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_POSTHOG_PROXY_TARGET = "https://us.i.posthog.com";
const REQUEST_HEADERS_TO_FORWARD = [
  "accept",
  "content-encoding",
  "content-type",
  "user-agent",
] as const;
const RESPONSE_HEADERS_TO_FORWARD = ["cache-control", "content-type"] as const;

type IngestRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function getProxyTargetBase() {
  return (process.env.POSTHOG_PROXY_TARGET ?? DEFAULT_POSTHOG_PROXY_TARGET).replace(/\/$/, "");
}

function buildTargetUrl(request: NextRequest, pathSegments: string[] = []) {
  const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const targetUrl = new URL(`${getProxyTargetBase()}/${encodedPath}`);

  targetUrl.search = request.nextUrl.search;
  return targetUrl;
}

function buildForwardedRequestHeaders(request: NextRequest) {
  const headers = new Headers();

  REQUEST_HEADERS_TO_FORWARD.forEach((name) => {
    const value = request.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  });

  return headers;
}

function buildForwardedResponseHeaders(upstreamResponse: Response) {
  const headers = new Headers();

  RESPONSE_HEADERS_TO_FORWARD.forEach((name) => {
    const value = upstreamResponse.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  });

  return headers;
}

async function proxyPostHogRequest(request: NextRequest, context: IngestRouteContext) {
  const { path = [] } = await context.params;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const requestBody = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstreamResponse = await fetch(buildTargetUrl(request, path), {
      method,
      headers: buildForwardedRequestHeaders(request),
      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
      redirect: "manual",
      cache: "no-store",
    });
    const responseBody = await upstreamResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: buildForwardedResponseHeaders(upstreamResponse),
    });
  } catch {
    return new NextResponse("PostHog proxy request failed", { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export { proxyPostHogRequest as GET, proxyPostHogRequest as POST };
