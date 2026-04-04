import { describe, expect, it } from "vitest";

import {
  legalConsentSchema,
  loginSchema,
  profileSchema,
  selectProfileSchema,
  subscriptionCheckoutSchema,
  subscriptionPixCheckoutSchema,
  verifyResetCodeSchema,
  whatsappAudiobookSubscribeSchema,
  whatsappPromiseSubscribeSchema,
} from "@/lib/validation";

describe("lib/validation", () => {
  it("normaliza email no login com trim", () => {
    const parsed = loginSchema.parse({
      email: "  joao@email.com  ",
      password: "12345678",
    });

    expect(parsed.email).toBe("joao@email.com");
  });

  it("falha quando senha de login e curta", () => {
    const result = loginSchema.safeParse({
      email: "joao@email.com",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A senha precisa ter pelo menos 8 caracteres.",
      );
    }
  });

  it("falha quando profileId e vazio", () => {
    const result = selectProfileSchema.safeParse({ profileId: "   " });

    expect(result.success).toBe(false);
  });

  it("exige aceite explicito dos documentos legais", () => {
    const valid = legalConsentSchema.safeParse({
      acceptTerms: true,
      acceptPolicy: true,
      termsVersion: "terms-v1",
      policyVersion: "privacy-v1",
      locale: "pt-BR",
    });
    const invalid = legalConsentSchema.safeParse({
      acceptTerms: true,
      acceptPolicy: false,
      termsVersion: "terms-v1",
      policyVersion: "privacy-v1",
      locale: "pt-BR",
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("valida payload de assinatura de promessas no WhatsApp", () => {
    const result = whatsappPromiseSubscribeSchema.safeParse({
      whatsappNumber: "5511999999999",
      endDate: "2026-12-31T10:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita numero de WhatsApp incompleto", () => {
    const result = whatsappPromiseSubscribeSchema.safeParse({
      whatsappNumber: "551199999999",
      endDate: "2026-12-31T10:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("valida payload de assinatura de audiobook no WhatsApp", () => {
    const result = whatsappAudiobookSubscribeSchema.safeParse({
      book: "Jonas",
      abbrev: "jn",
      whatsappNumber: "5511999999999",
      totalChapters: 4,
    });

    expect(result.success).toBe(true);
  });

  it("valida codigo de reset com 6 digitos", () => {
    const successResult = verifyResetCodeSchema.safeParse({
      email: "joao@email.com",
      code: "123456",
    });
    const errorResult = verifyResetCodeSchema.safeParse({
      email: "joao@email.com",
      code: "12345",
    });

    expect(successResult.success).toBe(true);
    expect(errorResult.success).toBe(false);
  });

  it("aceita apenas tipos de perfil validos", () => {
    const valid = profileSchema.safeParse({ name: "Joao", type: "adult" });
    const invalid = profileSchema.safeParse({ name: "Joao", type: "unknown" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("valida o ciclo de cobranca da assinatura", () => {
    const valid = subscriptionCheckoutSchema.safeParse({
      billingCycle: "monthly",
      platform: "web",
    });
    const invalid = subscriptionCheckoutSchema.safeParse({
      billingCycle: "weekly",
      platform: "mobile",
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("valida o CPF no checkout PIX", () => {
    const valid = subscriptionPixCheckoutSchema.safeParse({
      taxId: "04711686029",
    });
    const invalid = subscriptionPixCheckoutSchema.safeParse({
      taxId: "0471168602",
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
