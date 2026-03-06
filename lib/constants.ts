import type { ProfileType } from "@/lib/auth/types";
export const APP_ROUTES = {
  root: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  profiles: "/profiles",
  app: "/app",
} as const;

export const SESSION_COOKIE_NAME = "ba_session";
export const AUTH_COOKIE_NAME = "token";
export const PROFILE_LIMITS: Record<ProfileType, number> = {
  adult: 2,
  child: 1,
};

export const FUTURE_FEATURES = [
  "Biblioteca",
  "Jornadas",
  "Playlists",
  "Histórico",
  "Downloads",
  "Configuracoes",
] as const;
