import { describe, expect, it } from "vitest";

import { decryptToken, encryptToken, parseEncryptionKey } from "./token";

const KEY = parseEncryptionKey("AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=");
const OTHER_KEY = parseEncryptionKey("AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI=");

describe("token encryption", () => {
  it("roundtrips a token", () => {
    const encrypted = encryptToken("threads-access-token", KEY);
    expect(encrypted.startsWith("v1.")).toBe(true);
    expect(encrypted).not.toContain("threads-access-token");
    expect(decryptToken(encrypted, KEY)).toBe("threads-access-token");
  });

  it("uses a fresh iv so the same token encrypts differently", () => {
    expect(encryptToken("same", KEY)).not.toBe(encryptToken("same", KEY));
  });

  it("rejects a different key", () => {
    const encrypted = encryptToken("secret", KEY);
    expect(() => decryptToken(encrypted, OTHER_KEY)).toThrow();
  });

  it("rejects a tampered ciphertext", () => {
    const encrypted = encryptToken("secret", KEY);
    const parts = encrypted.split(".");
    const last = Buffer.from(parts[3], "base64url");
    last[0] ^= 1;
    parts[3] = last.toString("base64url");
    expect(() => decryptToken(parts.join("."), KEY)).toThrow();
  });

  it("rejects a malformed payload", () => {
    expect(() => decryptToken("not-a-token", KEY)).toThrow();
    expect(() => decryptToken("v2.aa.bb.cc", KEY)).toThrow();
  });

  it("rejects a key with the wrong length", () => {
    expect(() => parseEncryptionKey("short")).toThrow();
  });
});
