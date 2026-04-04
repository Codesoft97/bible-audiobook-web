import type { ProfileType } from "@/lib/auth/types";

export const APP_ROUTES = {
  root: "/",
  privacyPolicy: "/politica-de-privacidade",
  termsOfUse: "/termos-de-uso",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  profiles: "/profiles",
  profilesLegalAcceptance: "/profiles/aceite",
  app: "/app",
  redirectApp: "/redirect/app",
  subscription: "/subscription",
  subscriptionSuccess: "/subscription/success",
  subscriptionCancel: "/subscription/cancel",
} as const;

export const CONTACT_EMAIL = "evangelhoemaudio@gmail.com";
export const DEFAULT_REQUIRED_LEGAL_DOCUMENTS = {
  termsVersion: "terms-v1",
  policyVersion: "privacy-v1",
} as const;
export const LEGAL_CONSENT_LOCALE = "pt-BR";
export const SESSION_COOKIE_NAME = "ba_session";
export const AUTH_COOKIE_NAME = "token";
export const REFRESH_COOKIE_NAME = "refreshToken";
export const PROFILE_LIMITS: Record<ProfileType, number> = {
  adult: 2,
  child: 1,
};

export const WHATSAPP_AUDIOBOOKS_ENABLED = false;
export const WHATSAPP_AUDIOBOOKS_COMING_SOON_MESSAGE =
  "Estamos terminando o primeiro livro, em breve estara disponivel.";
export const WHATSAPP_FEATURE_ENABLED = false;

export const FUTURE_FEATURES = [
  "Biblioteca",
  "Jornadas",
  "Playlists",
  "Histórico",
  "Downloads",
  "Configuracoes",
] as const;
