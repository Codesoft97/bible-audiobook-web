import { describe, expect, it } from "vitest";

import {
  WHATSAPP_AUDIOBOOK_CONSENT_TEXT_SNAPSHOT,
  WHATSAPP_CONSENT_CATEGORY,
  WHATSAPP_CONSENT_SOURCE,
  WHATSAPP_PROMISE_CONSENT_TEXT_SNAPSHOT,
  buildAudiobookEndDate,
  buildAudiobookSubscribePayload,
  buildCancelPayload,
  buildPromiseSubscribePayload,
  extractRequestIp,
  resolveRequestLocale,
} from "@/lib/whatsapp-consent";

describe("lib/whatsapp-consent", () => {
  it("extrai o primeiro IP de x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(extractRequestIp(headers)).toBe("203.0.113.10");
  });

  it("normaliza locale a partir de accept-language", () => {
    const headers = new Headers({
      "accept-language": "pt-br,pt;q=0.9,en;q=0.8",
    });

    expect(resolveRequestLocale(headers)).toBe("pt-BR");
  });

  it("monta payload de promessas com metadados de consentimento", () => {
    const acceptedAt = new Date("2026-03-19T12:00:00.000Z");
    const payload = buildPromiseSubscribePayload(
      {
        whatsappNumber: "5551992341988",
        endDate: "2026-04-01T23:59:59.999Z",
      },
      new Headers({
        "accept-language": "pt-BR",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "BibleAudiobookWeb/1.0.0",
      }),
      acceptedAt,
    );

    expect(payload).toMatchObject({
      whatsappNumber: "5551992341988",
      consentStatus: "opted_in",
      consentAcceptedAt: "2026-03-19T12:00:00.000Z",
      consentSource: WHATSAPP_CONSENT_SOURCE,
      consentCategory: WHATSAPP_CONSENT_CATEGORY,
      consentTextSnapshot: WHATSAPP_PROMISE_CONSENT_TEXT_SNAPSHOT,
      locale: "pt-BR",
      ip: "203.0.113.10",
      userAgent: "BibleAudiobookWeb/1.0.0",
      endDate: "2026-04-01T23:59:59.999Z",
    });
  });

  it("monta payload de audiobook com progresso inicial e prazo calculado", () => {
    const acceptedAt = new Date("2026-03-19T12:00:00.000Z");
    const payload = buildAudiobookSubscribePayload(
      {
        book: "Jonas",
        abbrev: "jn",
        whatsappNumber: "5551992341988",
        totalChapters: 4,
      },
      new Headers({
        "accept-language": "pt-BR",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "BibleAudiobookWeb/1.0.0",
      }),
      acceptedAt,
    );

    expect(payload).toMatchObject({
      book: "Jonas",
      currentChapter: 1,
      nextChapter: 2,
      endDate: buildAudiobookEndDate(acceptedAt, 4),
      consentAcceptedAt: "2026-03-19T12:00:00.000Z",
      consentTextSnapshot: WHATSAPP_AUDIOBOOK_CONSENT_TEXT_SNAPSHOT,
      locale: "pt-BR",
      ip: "203.0.113.10",
    });
  });

  it("monta payload de cancelamento com metadados de opt-out", () => {
    const payload = buildCancelPayload(new Date("2026-03-21T09:30:00.000Z"));

    expect(payload).toEqual({
      optedOutAt: "2026-03-21T09:30:00.000Z",
      optedOutSource: "app_settings",
      optedOutReason: "manual_cancel",
    });
  });
});
