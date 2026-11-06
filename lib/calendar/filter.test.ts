import { describe, expect, it } from "vitest";

import {
  buildCalendarHref,
  countPostsByAccount,
  filterPostsByAccounts,
  parseAccountsParam,
  serializeAccountsParam,
  toggleAccountInSelection,
} from "./filter";
import type { CalendarPost } from "./types";

const IDS = ["acct-a", "acct-b", "acct-c"];

function post(id: string, targets: string[]): CalendarPost {
  return { id, day: 0, time: "08:00", targets, status: "scheduled", caption: id };
}

describe("account filter param", () => {
  it("treats a missing param as all accounts", () => {
    expect(parseAccountsParam(undefined, IDS)).toBeNull();
    expect(parseAccountsParam(null, IDS)).toBeNull();
  });

  it("treats an empty param as no account selected", () => {
    expect(parseAccountsParam("", IDS)).toEqual(new Set());
    expect(parseAccountsParam([], IDS)).toEqual(new Set());
  });

  it("parses comma-separated ids and the repeated-param form", () => {
    expect(parseAccountsParam("acct-a,acct-b", IDS)).toEqual(
      new Set(["acct-a", "acct-b"]),
    );
    expect(parseAccountsParam(["acct-a", "acct-b"], IDS)).toEqual(
      new Set(["acct-a", "acct-b"]),
    );
    expect(parseAccountsParam(["acct-a,acct-b", "acct-c"], IDS)).toEqual(
      new Set(["acct-a", "acct-b", "acct-c"]),
    );
  });

  it("drops unknown ids and dedupes", () => {
    expect(parseAccountsParam("acct-a,bogus,acct-a", IDS)).toEqual(
      new Set(["acct-a"]),
    );
    expect(parseAccountsParam("bogus", IDS)).toEqual(new Set());
  });
});

describe("serialize accounts param", () => {
  it("omits the param when all accounts are selected", () => {
    expect(serializeAccountsParam(null, IDS)).toBeNull();
    expect(serializeAccountsParam(new Set(IDS), IDS)).toBeNull();
  });

  it("keeps an explicit empty value for none selected", () => {
    expect(serializeAccountsParam(new Set(), IDS)).toBe("");
  });

  it("joins a subset in account order", () => {
    expect(serializeAccountsParam(new Set(["acct-c", "acct-a"]), IDS)).toBe(
      "acct-a,acct-c",
    );
  });
});

describe("toggle account selection", () => {
  it("removes one account from all", () => {
    expect(toggleAccountInSelection(null, "acct-b", IDS)).toEqual(
      new Set(["acct-a", "acct-c"]),
    );
  });

  it("adds and removes single accounts", () => {
    expect(toggleAccountInSelection(new Set(["acct-a"]), "acct-b", IDS)).toEqual(
      new Set(["acct-a", "acct-b"]),
    );
    expect(toggleAccountInSelection(new Set(["acct-a"]), "acct-a", IDS)).toEqual(
      new Set(),
    );
  });
});

describe("filter posts by accounts", () => {
  it("returns all posts when nothing is filtered", () => {
    const posts = [post("1", ["acct-a"]), post("2", ["acct-b"])];
    expect(filterPostsByAccounts(posts, null)).toBe(posts);
  });

  it("shows a post when any of its targets is selected", () => {
    const posts = [
      post("1", ["acct-a", "acct-b"]),
      post("2", ["acct-b", "acct-c"]),
      post("3", ["acct-c"]),
      post("4", []),
    ];
    expect(
      filterPostsByAccounts(posts, new Set(["acct-a"])).map((item) => item.id),
    ).toEqual(["1"]);
    expect(filterPostsByAccounts(posts, new Set())).toEqual([]);
  });
});

describe("count posts by account", () => {
  it("counts a multi-target post for each of its accounts", () => {
    const posts = [
      post("1", ["acct-a", "acct-b"]),
      post("2", ["acct-a"]),
    ];
    const counts = countPostsByAccount(posts);
    expect(counts.get("acct-a")).toBe(2);
    expect(counts.get("acct-b")).toBe(1);
    expect(counts.get("acct-c")).toBeUndefined();
  });
});

describe("build calendar href", () => {
  it("returns the root when no param is set", () => {
    expect(buildCalendarHref({})).toBe("/");
  });

  it("preserves week, day, and a serialized accounts value", () => {
    expect(buildCalendarHref({ week: "2026-11-02" })).toBe("/?week=2026-11-02");
    expect(
      buildCalendarHref({ week: "2026-11-02", day: 3, accounts: "acct-a" }),
    ).toBe("/?week=2026-11-02&day=3&accounts=acct-a");
    expect(buildCalendarHref({ accounts: "" })).toBe("/?accounts=");
    expect(buildCalendarHref({ accounts: null })).toBe("/");
  });

  it("adds the composer and saved flags", () => {
    expect(buildCalendarHref({ week: "2026-11-02", compose: true })).toBe(
      "/?week=2026-11-02&compose=1",
    );
    expect(buildCalendarHref({ week: "2026-11-02", day: 3, saved: true })).toBe(
      "/?week=2026-11-02&day=3&saved=1",
    );
  });
});
