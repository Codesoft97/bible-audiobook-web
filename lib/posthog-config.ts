export const POSTHOG_CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ttclid",
] as const;

export interface PostHogClientConfig {
  enabled: boolean;
  token: string;
  host: string;
  uiHost: string;
  autocapture: boolean;
  campaignOnly: boolean;
  heatmapsEnabled: boolean;
  maskAllText: boolean;
  maskAllElementAttributes: boolean;
  sessionReplayEnabled: boolean;
  sessionReplaySampleRate: number;
}

function parseBoolean(value: string, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseSampleRate(value: string, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, parsed));
}

export function getPostHogClientConfig(): PostHogClientConfig {
  const enabled = (process.env.NEXT_PUBLIC_POSTHOG_ENABLED ?? "").trim();
  const token = (process.env.NEXT_PUBLIC_POSTHOG_TOKEN ?? "").trim();
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "").trim();
  const uiHost = (process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "").trim();
  const autocapture = (process.env.NEXT_PUBLIC_POSTHOG_AUTOCAPTURE ?? "").trim();
  const campaignOnly = (process.env.NEXT_PUBLIC_POSTHOG_CAMPAIGN_ONLY ?? "").trim();
  const heatmapsEnabled = (process.env.NEXT_PUBLIC_POSTHOG_HEATMAPS ?? "").trim();
  const maskAllText = (process.env.NEXT_PUBLIC_POSTHOG_MASK_ALL_TEXT ?? "").trim();
  const maskAllElementAttributes = (
    process.env.NEXT_PUBLIC_POSTHOG_MASK_ALL_ELEMENT_ATTRIBUTES ?? ""
  ).trim();
  const sessionReplayEnabled = (process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY ?? "").trim();
  const sessionReplaySampleRate = (
    process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY_SAMPLE_RATE ?? ""
  ).trim();

  return {
    enabled: parseBoolean(enabled, false) && token.length > 0,
    token,
    host: host || "https://us.i.posthog.com",
    uiHost: uiHost || "https://us.posthog.com",
    autocapture: parseBoolean(autocapture, true),
    campaignOnly: parseBoolean(campaignOnly, false),
    heatmapsEnabled: parseBoolean(heatmapsEnabled, true),
    maskAllText: parseBoolean(maskAllText, false),
    maskAllElementAttributes: parseBoolean(maskAllElementAttributes, true),
    sessionReplayEnabled: parseBoolean(sessionReplayEnabled, false),
    sessionReplaySampleRate: parseSampleRate(sessionReplaySampleRate, 0.1),
  };
}
