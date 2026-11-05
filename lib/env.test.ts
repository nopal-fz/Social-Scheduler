import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

const databaseUrl = "postgres://user:pass@localhost:5432/jadwalin";
const sessionSecret = "test-only-session-secret-with-32-chars";

describe("parseEnv", () => {
  it("applies development defaults", () => {
    expect(parseEnv({ DATABASE_URL: databaseUrl, SESSION_SECRET: sessionSecret })).toEqual({
      NODE_ENV: "development",
      APP_URL: "http://localhost:3000",
      DATABASE_URL: databaseUrl,
      SESSION_SECRET: sessionSecret,
    });
  });

  it("rejects an invalid APP_URL", () => {
    expect(() =>
      parseEnv({ APP_URL: "not a url", DATABASE_URL: databaseUrl, SESSION_SECRET: sessionSecret }),
    ).toThrow();
  });

  it("requires DATABASE_URL", () => {
    expect(() => parseEnv({ SESSION_SECRET: sessionSecret })).toThrow();
  });

  it("requires a SESSION_SECRET of at least 32 characters", () => {
    expect(() => parseEnv({ DATABASE_URL: databaseUrl, SESSION_SECRET: "short" })).toThrow();
  });
});
