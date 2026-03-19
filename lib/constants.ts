import type { ProfileType } from "@/lib/auth/types";
export const APP_ROUTES = {
  root: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  profiles: "/profiles",
  app: "/app",
  redirectApp: "/redirect/app",
  subscription: "/subscription",
  subscriptionSuccess: "/subscription/success",
  subscriptionCancel: "/subscription/cancel",
} as const;

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

export const FUTURE_FEATURES = [
  "Biblioteca",
  "Jornadas",
  "Playlists",
  "Histórico",
  "Downloads",
  "Configuracoes",
] as const;
