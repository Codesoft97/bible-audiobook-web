import type {
  WhatsAppAudiobookSubscribeInput,
  WhatsAppAudiobookSubscribePayload,
  WhatsAppCancelPayload,
  WhatsAppPromiseSubscribeInput,
  WhatsAppPromiseSubscribePayload,
} from "@/lib/whatsapp";

const DEFAULT_LOCALE = "pt-BR";
const UNKNOWN_IP = "unknown";
const UNKNOWN_USER_AGENT = "unknown";

export const WHATSAPP_CONSENT_SOURCE = "app_settings";
export const WHATSAPP_CONSENT_CATEGORY = "daily_bible_content";
export const WHATSAPP_CONSENT_TEXT_VERSION = "whatsapp-daily-content-v1";
export const WHATSAPP_PROMISE_CONSENT_TEXT_SNAPSHOT =
  "Aceito receber no meu WhatsApp a Promessa do Dia da Evangelho em Áudio, com mensagem diária e opção de ouvir o áudio.";
export const WHATSAPP_AUDIOBOOK_CONSENT_TEXT_SNAPSHOT =
  "Aceito receber no meu WhatsApp o Capítulo do Dia da Evangelho em Áudio, com mensagem diária e opção de ouvir o áudio.";
export const WHATSAPP_ACCEPTED_BY = "self";
export const WHATSAPP_POLICY_VERSION = "privacy-v2";
export const WHATSAPP_TERMS_VERSION = "terms-v3";
export const WHATSAPP_OPTOUT_SOURCE = "app_settings";
export const WHATSAPP_OPTOUT_REASON = "manual_cancel";

function normalizeLocale(value: string | null) {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const primaryTag = value
    .split(",")[0]
    ?.split(";")[0]
    ?.trim()
    .replace(/_/g, "-");

  if (!primaryTag || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(primaryTag)) {
    return DEFAULT_LOCALE;
  }

  const [language, region, ...rest] = primaryTag.split("-");

  return [language?.toLowerCase(), region?.toUpperCase(), ...rest].filter(Boolean).join("-");
}

function stripAddressDecorators(value: string) {
  return value.replace(/^\[|]$/g, "").replace(/^"|"$/g, "");
}

export function extractRequestIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",").map((part) => part.trim()).filter(Boolean);

    if (firstIp) {
      return stripAddressDecorators(firstIp);
    }
  }

  const realIp = headers.get("x-real-ip") ?? headers.get("cf-connecting-ip");

  if (realIp) {
    return stripAddressDecorators(realIp.trim());
  }

  const forwarded = headers.get("forwarded");

  if (forwarded) {
    const match = forwarded.match(/for=(?:"?\[?)([^;,\]\"]+)/i);

    if (match?.[1]) {
      return stripAddressDecorators(match[1].trim());
    }
  }

  return UNKNOWN_IP;
}

export function resolveRequestLocale(headers: Headers) {
  return normalizeLocale(headers.get("accept-language"));
}

export function resolveRequestUserAgent(headers: Headers) {
  return headers.get("user-agent")?.trim() || UNKNOWN_USER_AGENT;
}

export function buildAudiobookEndDate(acceptedAt: Date, totalChapters: number) {
  const endDate = new Date(acceptedAt);

  endDate.setUTCDate(endDate.getUTCDate() + Math.max(totalChapters, 1));
  endDate.setUTCHours(23, 59, 59, 999);

  return endDate.toISOString();
}

function buildConsentMetadata(
  headers: Headers,
  endDate: string,
  consentTextSnapshot: string,
  acceptedAt: Date,
) {
  return {
    consentStatus: "opted_in" as const,
    consentAcceptedAt: acceptedAt.toISOString(),
    consentSource: WHATSAPP_CONSENT_SOURCE,
    consentCategory: WHATSAPP_CONSENT_CATEGORY,
    consentTextVersion: WHATSAPP_CONSENT_TEXT_VERSION,
    consentTextSnapshot,
    locale: resolveRequestLocale(headers),
    ip: extractRequestIp(headers),
    userAgent: resolveRequestUserAgent(headers),
    acceptedBy: WHATSAPP_ACCEPTED_BY,
    policyVersion: WHATSAPP_POLICY_VERSION,
    termsVersion: WHATSAPP_TERMS_VERSION,
    endDate,
  };
}

export function buildPromiseSubscribePayload(
  input: WhatsAppPromiseSubscribeInput,
  headers: Headers,
  acceptedAt = new Date(),
): WhatsAppPromiseSubscribePayload {
  return {
    ...input,
    ...buildConsentMetadata(
      headers,
      input.endDate,
      WHATSAPP_PROMISE_CONSENT_TEXT_SNAPSHOT,
      acceptedAt,
    ),
  };
}

export function buildAudiobookSubscribePayload(
  input: WhatsAppAudiobookSubscribeInput,
  headers: Headers,
  acceptedAt = new Date(),
): WhatsAppAudiobookSubscribePayload {
  const currentChapter = 1;
  const nextChapter = input.totalChapters > 1 ? 2 : 1;
  const endDate = buildAudiobookEndDate(acceptedAt, input.totalChapters);

  return {
    ...input,
    currentChapter,
    nextChapter,
    ...buildConsentMetadata(
      headers,
      endDate,
      WHATSAPP_AUDIOBOOK_CONSENT_TEXT_SNAPSHOT,
      acceptedAt,
    ),
  };
}

export function buildCancelPayload(optedOutAt = new Date()): WhatsAppCancelPayload {
  return {
    optedOutAt: optedOutAt.toISOString(),
    optedOutSource: WHATSAPP_OPTOUT_SOURCE,
    optedOutReason: WHATSAPP_OPTOUT_REASON,
  };
}
