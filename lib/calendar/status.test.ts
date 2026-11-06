import { describe, expect, it } from "vitest";

import { calendarStatus } from "./status";

describe("calendar post status", () => {
  it("derives from target statuses using the design priority", () => {
    expect(calendarStatus(["published", "published"], "scheduled")).toBe("published");
    expect(calendarStatus(["failed", "published"], "scheduled")).toBe("partial");
    expect(calendarStatus(["failed", "scheduled"], "scheduled")).toBe("failed");
    expect(calendarStatus(["publishing", "published"], "scheduled")).toBe("publishing");
    expect(calendarStatus(["scheduled", "published"], "scheduled")).toBe("scheduled");
  });

  it("falls back to the post status when there are no targets", () => {
    expect(calendarStatus([], "done")).toBe("published");
    expect(calendarStatus([], "partial")).toBe("partial");
    expect(calendarStatus([], "failed")).toBe("failed");
    expect(calendarStatus([], "scheduled")).toBe("scheduled");
    expect(calendarStatus([], "draft")).toBe("scheduled");
  });
});
