import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

const databaseUrl = "postgres://user:pass@localhost:5432/jadwalin";

describe("parseEnv", () => {
  it("applies development defaults", () => {
    expect(parseEnv({ DATABASE_URL: databaseUrl })).toEqual({
      NODE_ENV: "development",
      APP_URL: "http://localhost:3000",
      DATABASE_URL: databaseUrl,
    });
  });

  it("rejects an invalid APP_URL", () => {
    expect(() => parseEnv({ APP_URL: "not a url", DATABASE_URL: databaseUrl })).toThrow();
  });

  it("requires DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow();
  });
});
