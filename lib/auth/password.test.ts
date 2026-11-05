import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("verifies the original password", async () => {
    const stored = await hashPassword("rahasia-uji-123");
    await expect(verifyPassword("rahasia-uji-123", stored)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("rahasia-uji-123");
    await expect(verifyPassword("rahasia-uji-124", stored)).resolves.toBe(false);
  });

  it("rejects an unsupported hash format", async () => {
    await expect(verifyPassword("apa-saja", "plaintext")).resolves.toBe(false);
    await expect(verifyPassword("apa-saja", "scrypt::")).resolves.toBe(false);
  });
});
