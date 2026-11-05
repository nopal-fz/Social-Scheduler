import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("blocks after the limit inside the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });

    expect(limiter.consume("ip", 0)).toBe(true);
    expect(limiter.consume("ip", 100)).toBe(true);
    expect(limiter.consume("ip", 200)).toBe(false);
  });

  it("allows again after the window passes", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.consume("ip", 0)).toBe(true);
    expect(limiter.consume("ip", 1000)).toBe(true);
  });

  it("keeps keys independent", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.consume("a", 0)).toBe(true);
    expect(limiter.consume("a", 10)).toBe(false);
    expect(limiter.consume("b", 10)).toBe(true);
  });
});
