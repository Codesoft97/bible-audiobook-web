interface JwtPayload {
  exp?: number;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);
  const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpirationTime(token: string) {
  const payload = parseJwtPayload(token);

  if (!payload || typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    return null;
  }

  return payload.exp;
}

export function isTokenExpiredOrNearExpiry(
  token: string,
  options: {
    now?: number;
    bufferSeconds?: number;
  } = {},
) {
  const expirationTime = getTokenExpirationTime(token);

  if (!expirationTime) {
    return true;
  }

  const now = options.now ?? Date.now();
  const bufferSeconds = options.bufferSeconds ?? 60;

  return expirationTime * 1000 - now <= bufferSeconds * 1000;
}
