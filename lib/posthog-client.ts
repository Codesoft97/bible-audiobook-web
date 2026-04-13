"use client";

import posthog from "posthog-js";

import { getPostHogClientConfig } from "@/lib/posthog-config";

type AnalyticsProperties = Record<string, unknown>;

function isPostHogLoaded() {
  return Boolean((posthog as unknown as { __loaded?: boolean }).__loaded);
}

export function isAnalyticsClientEnabled() {
  return getPostHogClientConfig().enabled && isPostHogLoaded();
}

export function captureAnalyticsEvent(event: string, properties: AnalyticsProperties = {}) {
  if (!isAnalyticsClientEnabled()) {
    return;
  }

  posthog.capture(event, {
    app: "bible-audiobook-web",
    ...properties,
  });
}

export function identifyAnalyticsUser(userId: string, properties: AnalyticsProperties = {}) {
  if (!isAnalyticsClientEnabled()) {
    return;
  }

  posthog.identify(userId, properties);
}

export function resetAnalytics() {
  if (!isAnalyticsClientEnabled()) {
    return;
  }

  posthog.reset();
}
