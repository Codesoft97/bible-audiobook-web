import { z } from "zod";

import { FEEDBACK_CATEGORIES } from "@/lib/feedbacks";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um email valido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no maximo 72 caracteres."),
});

export const registerSchema = loginSchema.extend({
  userName: z
    .string()
    .trim()
    .min(2, "Informe o seu nome.")
    .max(80, "O nome deve ter no maximo 80 caracteres."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Informe um email valido."),
});

export const verifyResetCodeSchema = forgotPasswordSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Informe o codigo de 6 digitos."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token ausente."),
  newPassword: z
    .string()
    .min(8, "A nova senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A nova senha deve ter no maximo 72 caracteres."),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do perfil.")
    .max(60, "O nome do perfil deve ter no maximo 60 caracteres."),
  type: z.enum(["adult", "child"]),
});

export const selectProfileSchema = z.object({
  profileId: z.string().trim().min(1, "Perfil invalido."),
});

export const legalConsentSchema = z.object({
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Voce precisa aceitar os Termos de Uso.",
  }),
  acceptPolicy: z.boolean().refine((value) => value, {
    message: "Voce precisa aceitar a Politica de Privacidade.",
  }),
  termsVersion: z.string().trim().min(1, "Versao dos Termos de Uso invalida."),
  policyVersion: z.string().trim().min(1, "Versao da Politica de Privacidade invalida."),
  locale: z.string().trim().min(1, "Locale invalido."),
});

const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{13}$/, "Informe um numero de WhatsApp valido com DDI e DDD.");

export const whatsappPromiseSubscribeSchema = z.object({
  whatsappNumber: whatsappNumberSchema,
  endDate: z
    .string()
    .trim()
    .min(1, "Informe a data final da assinatura.")
    .datetime("Informe uma data final valida."),
});

export const whatsappAudiobookSubscribeSchema = z.object({
  book: z.string().trim().min(1, "Informe o livro da Biblia."),
  abbrev: z.string().trim().min(1, "Informe a abreviacao do livro."),
  whatsappNumber: whatsappNumberSchema,
  totalChapters: z
    .number()
    .int("Total de capitulos invalido.")
    .min(1, "Total de capitulos invalido."),
});

export const subscriptionCheckoutSchema = z.object({
  billingCycle: z.enum(["monthly", "annual"]),
  platform: z.literal("web"),
});

export const subscriptionPixCheckoutSchema = z.object({
  taxId: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "Informe um CPF valido com 11 digitos."),
});

export const feedbackCreateSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES, {
    errorMap: () => ({
      message:
        "A categoria do feedback deve ser bug, melhoria, funcionalidade nova ou comentario geral",
    }),
  }),
  description: z.string().trim().min(1, "Descreva o feedback."),
});
