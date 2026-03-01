const DEFAULT_BACKEND_URL = "http://localhost:5000/api";
const DEFAULT_SESSION_SECRET = "change-this-secret-in-production";
const NODE_ENV = process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";

function readEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV,
  BACKEND_API_URL: readEnv("BACKEND_API_URL", DEFAULT_BACKEND_URL),
  SESSION_SECRET: readEnv(
    "SESSION_SECRET",
    IS_PRODUCTION ? undefined : DEFAULT_SESSION_SECRET,
  ),
  IS_PRODUCTION,
};
