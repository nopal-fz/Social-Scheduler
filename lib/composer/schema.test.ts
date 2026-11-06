import { describe, expect, it } from "vitest";

import { CAPTION_LIMIT, nextQuarterHour, parseComposerInput } from "./schema";

const NOW = new Date("2026-11-05T02:00:00Z"); // 09:00 Jakarta
const ACCOUNTS = ["acct-a", "acct-b"];

function parse(overrides: Partial<Parameters<typeof parseComposerInput>[0]> = {}) {
  return parseComposerInput(
    {
      caption: "Halo dari composer",
      accountIds: ["acct-a"],
      date: "2026-11-05",
      time: "10:00",
      ...overrides,
    },
    { allowedAccountIds: ACCOUNTS, now: NOW },
  );
}

describe("composer input", () => {
  it("accepts a valid future post and converts Jakarta time to UTC", () => {
    const result = parse();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.scheduledAt.toISOString()).toBe("2026-11-05T03:00:00.000Z");
    expect(result.value.weekStartIso).toBe("2026-11-02");
    expect(result.value.day).toBe(3);
  });

  it("trims the caption and drops duplicate accounts", () => {
    const result = parse({ caption: "  spasi  ", accountIds: ["acct-a", "acct-a"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.caption).toBe("spasi");
    expect(result.value.accountIds).toEqual(["acct-a"]);
  });

  it("rejects an empty caption", () => {
    expect(parse({ caption: "   " })).toEqual({ ok: false, error: "Tulis caption dulu." });
  });

  it("rejects a caption over the limit and states the counted length", () => {
    const caption = "a".repeat(CAPTION_LIMIT + 1);
    const result = parse({ caption });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain(`${CAPTION_LIMIT + 1} karakter`);
  });

  it("requires at least one account", () => {
    expect(parse({ accountIds: [] })).toEqual({
      ok: false,
      error: "Pilih minimal satu akun.",
    });
  });

  it("rejects an account the user does not own", () => {
    expect(parse({ accountIds: ["acct-a", "acct-x"] })).toEqual({
      ok: false,
      error: "Akun itu tidak tersedia. Muat ulang halaman lalu coba lagi.",
    });
  });

  it("rejects invalid date or time", () => {
    expect(parse({ date: "2026-02-30" })).toEqual({
      ok: false,
      error: "Tanggal atau jam tidak valid.",
    });
    expect(parse({ time: "24:00" })).toEqual({
      ok: false,
      error: "Tanggal atau jam tidak valid.",
    });
    expect(parse({ time: "nope" })).toEqual({
      ok: false,
      error: "Tanggal atau jam tidak valid.",
    });
  });

  it("rejects a time in the past", () => {
    expect(parse({ time: "08:59" })).toEqual({
      ok: false,
      error: "Waktu sudah lewat. Pilih waktu setelah sekarang.",
    });
  });
});

describe("next quarter hour", () => {
  it("rounds up to the next 15 minutes", () => {
    expect(nextQuarterHour(9 * 60 + 7)).toBe("09:15");
    expect(nextQuarterHour(9 * 60)).toBe("09:15");
    expect(nextQuarterHour(9 * 60 + 44)).toBe("09:45");
  });

  it("clamps at 23:45", () => {
    expect(nextQuarterHour(23 * 60 + 50)).toBe("23:45");
  });
});
