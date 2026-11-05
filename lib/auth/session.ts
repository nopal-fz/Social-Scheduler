import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "jadwalin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(userId: string, secret: string, now = Date.now()): string {
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [userId, expiresAtRaw, signature] = parts;
  if (!userId || !expiresAtRaw || !signature) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) {
    return null;
  }

  const expected = Buffer.from(sign(`${userId}.${expiresAtRaw}`, secret));
  const actual = Buffer.from(signature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  return userId;
}
