import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um email valido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no maximo 72 caracteres."),
});

export const registerSchema = loginSchema.extend({
  familyName: z
    .string()
    .trim()
    .min(3, "Informe o nome da familia.")
    .max(80, "O nome da familia deve ter no maximo 80 caracteres."),
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

