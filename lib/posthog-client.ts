"use client";

import posthog from "posthog-js";

import {
  getPostHogClientConfig,
  POSTHOG_CAMPAIGN_PARAMS,
  type PostHogClientConfig,
} from "@/lib/posthog-config";

type AnalyticsProperties = Record<string, unknown>;

const CAMPAIGN_SESSION_KEY = "ba_posthog_campaign_session";
const REPLAY_SAMPLE_SESSION_KEY = "ba_posthog_replay_sample";
const RUNTIME_CONFIG_ENDPOINT = "/api/analytics/posthog-config";

const SENSITIVE_PROPERTY_NAMES = [
  "email",
  "name",
  "userName",
  "password",
  "refreshToken",
  "credential",
  "idToken",
  "whatsappNumber",
];

const readyListeners = new Set<() => void>();
let initializationStarted = false;
let analyticsReady = false;

function isPostHogLoaded() {
  return Boolean((posthog as unknown as { __loaded?: boolean }).__loaded);
}

export function isAnalyticsClientEnabled() {
  return analyticsReady && isPostHogLoaded();
}

export function onAnalyticsReady(listener: () => void) {
  if (isAnalyticsClientEnabled()) {
    listener();
    return () => undefined;
  }

  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

function notifyAnalyticsReady() {
  analyticsReady = true;

  readyListeners.forEach((listener) => {
    listener();
  });
  readyListeners.clear();
}

function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Browser privacy settings can block sessionStorage.
  }
}

function hasCampaignContext() {
  if (typeof window === "undefined") {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hasCampaignParam = POSTHOG_CAMPAIGN_PARAMS.some((param) => searchParams.has(param));

  if (hasCampaignParam) {
    writeSessionValue(CAMPAIGN_SESSION_KEY, "1");
    return true;
  }

  return readSessionValue(CAMPAIGN_SESSION_KEY) === "1";
}

function shouldRecordSession(sampleRate: number) {
  if (typeof window === "undefined" || sampleRate <= 0) {
    return false;
  }

  if (sampleRate >= 1) {
    return true;
  }

  const existingSample = readSessionValue(REPLAY_SAMPLE_SESSION_KEY);

  if (existingSample) {
    return existingSample === "1";
  }

  const sampledIn = Math.random() < sampleRate;
  writeSessionValue(REPLAY_SAMPLE_SESSION_KEY, sampledIn ? "1" : "0");
  return sampledIn;
}

function shouldInitializeAnalytics(config: PostHogClientConfig) {
  return config.enabled && (!config.campaignOnly || hasCampaignContext());
}

function isPostHogClientConfig(value: unknown): value is PostHogClientConfig {
  const config = value as Partial<PostHogClientConfig>;

  return (
    typeof config.enabled === "boolean" &&
    typeof config.token === "string" &&
    typeof config.host === "string" &&
    typeof config.uiHost === "string" &&
    typeof config.autocapture === "boolean" &&
    typeof config.campaignOnly === "boolean" &&
    typeof config.heatmapsEnabled === "boolean" &&
    typeof config.maskAllText === "boolean" &&
    typeof config.maskAllElementAttributes === "boolean" &&
    typeof config.sessionReplayEnabled === "boolean" &&
    typeof config.sessionReplaySampleRate === "number"
  );
}

async function fetchRuntimePostHogConfig() {
  try {
    const response = await fetch(RUNTIME_CONFIG_ENDPOINT, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as unknown;
    return isPostHogClientConfig(config) ? config : null;
  } catch {
    return null;
  }
}

function initializePostHog(config: PostHogClientConfig) {
  if (initializationStarted || !shouldInitializeAnalytics(config)) {
    return;
  }

  initializationStarted = true;

  const recordSession =
    config.sessionReplayEnabled && shouldRecordSession(config.sessionReplaySampleRate);

  posthog.init(config.token, {
    api_host: config.host,
    ui_host: config.uiHost,
    defaults: "2026-01-30",
    autocapture: config.autocapture,
    capture_pageview: "history_change",
    capture_pageleave: true,
    disable_session_recording: !recordSession,
    enable_heatmaps: config.heatmapsEnabled,
    mask_all_text: config.maskAllText,
    mask_all_element_attributes: config.maskAllElementAttributes,
    person_profiles: "identified_only",
    property_denylist: SENSITIVE_PROPERTY_NAMES,
    loaded: (posthogInstance) => {
      posthogInstance.register({
        app: "bible-audiobook-web",
        analytics_source: config.campaignOnly ? "campaign" : "all_traffic",
        session_replay_enabled: recordSession,
        session_replay_sample_rate: config.sessionReplaySampleRate,
      });
      notifyAnalyticsReady();
    },
  });
}

export function initializeAnalytics() {
  if (initializationStarted) {
    return;
  }

  const bundledConfig = getPostHogClientConfig();

  if (bundledConfig.enabled) {
    initializePostHog(bundledConfig);
    return;
  }

  void fetchRuntimePostHogConfig().then((runtimeConfig) => {
    if (runtimeConfig) {
      initializePostHog(runtimeConfig);
    }
  });
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
