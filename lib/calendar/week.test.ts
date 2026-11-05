import { describe, expect, it } from "vitest";

import {
  addDays,
  dayIndex,
  formatAgendaDate,
  formatWeekRange,
  getZonedNow,
  isGridTime,
  nowTop,
  parseDateParam,
  slotTop,
  startOfWeek,
  toIsoDate,
} from "./week";

describe("calendar week logic", () => {
  it("reads the Jakarta date across the UTC day boundary", () => {
    const now = getZonedNow(new Date("2026-11-04T17:30:00Z"));
    expect(now).toEqual({ date: { year: 2026, month: 11, day: 5 }, minutes: 30 });
  });

  it("starts the week on Monday", () => {
    expect(startOfWeek({ year: 2026, month: 11, day: 5 })).toEqual({
      year: 2026,
      month: 11,
      day: 2,
    });
    expect(startOfWeek({ year: 2026, month: 11, day: 8 })).toEqual({
      year: 2026,
      month: 11,
      day: 2,
    });
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
    expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
  });

  it("validates date params", () => {
    expect(parseDateParam("2026-11-02")).toEqual({ year: 2026, month: 11, day: 2 });
    expect(parseDateParam("2026-02-30")).toBeNull();
    expect(parseDateParam("2026-13-01")).toBeNull();
    expect(parseDateParam("nope")).toBeNull();
    expect(parseDateParam(undefined)).toBeNull();
  });

  it("finds the day index inside the week only", () => {
    const weekStart = { year: 2026, month: 11, day: 2 };
    expect(dayIndex(weekStart, { year: 2026, month: 11, day: 5 })).toBe(3);
    expect(dayIndex(weekStart, { year: 2026, month: 11, day: 9 })).toBeNull();
    expect(dayIndex(weekStart, { year: 2026, month: 11, day: 1 })).toBeNull();
  });

  it("formats range labels", () => {
    expect(formatWeekRange({ year: 2026, month: 11, day: 2 })).toBe("2–8 Nov 2026");
    expect(formatWeekRange({ year: 2026, month: 10, day: 26 })).toBe("26 Okt – 1 Nov 2026");
    expect(formatWeekRange({ year: 2026, month: 12, day: 28 })).toBe("28 Des 2026 – 3 Jan 2027");
  });

  it("formats the agenda date", () => {
    expect(formatAgendaDate({ year: 2026, month: 11, day: 5 })).toBe("Kamis, 5 November");
  });

  it("maps times to grid positions", () => {
    expect(slotTop("06:00")).toBe(0);
    expect(slotTop("08:30")).toBe(220);
    expect(slotTop("23:00")).toBe(1496);
    expect(nowTop(14 * 60 + 12)).toBe(slotTop("14:12"));
    expect(() => slotTop("8:30")).not.toThrow();
    expect(() => slotTop("nope")).toThrow();
  });

  it("marks times inside the visible grid", () => {
    expect(isGridTime(6 * 60)).toBe(true);
    expect(isGridTime(23 * 60)).toBe(true);
    expect(isGridTime(5 * 60 + 59)).toBe(false);
  });

  it("round-trips civil dates to ISO", () => {
    expect(toIsoDate({ year: 2026, month: 1, day: 5 })).toBe("2026-01-05");
  });
});
