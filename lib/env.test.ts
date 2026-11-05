import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("applies development defaults", () => {
    expect(parseEnv({})).toEqual({
      NODE_ENV: "development",
      APP_URL: "http://localhost:3000",
    });
  });

  it("rejects an invalid APP_URL", () => {
    expect(() => parseEnv({ APP_URL: "not a url" })).toThrow();
  });
});
