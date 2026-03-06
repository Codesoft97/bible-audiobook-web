const NODE_ENV = process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";

function readEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV,
  BACKEND_API_URL: readEnv("BACKEND_API_URL"),
  SESSION_SECRET: readEnv("SESSION_SECRET"),
  IS_PRODUCTION,
};
