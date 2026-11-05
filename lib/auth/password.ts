import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, KEY_LENGTH)).toString("base64url");
  return `scrypt:${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  if (expected.length === 0) {
    return false;
  }

  const actual = await scrypt(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
