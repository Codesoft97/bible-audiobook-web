import posthog from "posthog-js";

import { getPostHogClientConfig, POSTHOG_CAMPAIGN_PARAMS } from "@/lib/posthog-config";

const CAMPAIGN_SESSION_KEY = "ba_posthog_campaign_session";
const REPLAY_SAMPLE_SESSION_KEY = "ba_posthog_replay_sample";

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

const config = getPostHogClientConfig();

if (config.enabled && (!config.campaignOnly || hasCampaignContext())) {
  const recordSession = config.sessionReplayEnabled && shouldRecordSession(config.sessionReplaySampleRate);

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
    },
  });
}
