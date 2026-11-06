import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Format: v1.<iv>.<tag>.<ciphertext>, semua bagian base64url.
const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;
export const KEY_BYTES = 32;

export function parseEncryptionKey(value: string): Buffer {
  const key = Buffer.from(value, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64");
  }
  return key;
}

export function encryptToken(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [
    VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptToken(payload: string, key: Buffer): string {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("invalid token payload");
  }

  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error("invalid token payload");
  }

  // GCM memverifikasi tag; ciphertext yang diubah akan melempar error di sini.
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(Buffer.from(parts[3], "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
