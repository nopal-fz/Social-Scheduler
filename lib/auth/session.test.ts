import { describe, expect, it } from "vitest";

import { SESSION_TTL_SECONDS, createSessionToken, verifySessionToken } from "./session";

const secret = "test-only-session-secret-with-32-chars";
const otherSecret = "test-only-session-secret-with-32-chars-x";
const userId = "6f1f0f0e-0000-4000-8000-000000000000";
const now = Date.UTC(2026, 10, 5, 12, 0, 0);

describe("session token", () => {
  it("returns the user id for a valid token", () => {
    const token = createSessionToken(userId, secret, now);
    expect(verifySessionToken(token, secret, now)).toBe(userId);
  });

  it("expires after the TTL", () => {
    const token = createSessionToken(userId, secret, now);
    const afterExpiry = now + SESSION_TTL_SECONDS * 1000 + 1;
    expect(verifySessionToken(token, secret, afterExpiry)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createSessionToken(userId, secret, now);
    expect(verifySessionToken(token, otherSecret, now)).toBeNull();
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken(userId, secret, now);
    const tampered = token.replace(userId, "7f1f0f0e-0000-4000-8000-000000000000");
    expect(verifySessionToken(tampered, secret, now)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifySessionToken("", secret, now)).toBeNull();
    expect(verifySessionToken("a.b", secret, now)).toBeNull();
    expect(verifySessionToken("a.b.c.d", secret, now)).toBeNull();
  });
});
