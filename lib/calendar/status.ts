import type { PostStatus, TargetStatus } from "@/lib/db/schema";
import type { CalendarPostStatus } from "./types";

export const STATUS_LABELS: Record<CalendarPostStatus, string> = {
  scheduled: "Terjadwal",
  publishing: "Sedang terbit",
  published: "Terbit",
  partial: "Sebagian",
  failed: "Gagal",
};

export const LEGEND_ORDER: CalendarPostStatus[] = [
  "scheduled",
  "publishing",
  "published",
  "partial",
  "failed",
];

// Priority from docs/design.md: failed > partial > publishing > scheduled > published.
export function calendarStatus(
  targetStatuses: TargetStatus[],
  postStatus: PostStatus,
): CalendarPostStatus {
  if (targetStatuses.length > 0) {
    const failed = targetStatuses.includes("failed");
    const published = targetStatuses.includes("published");

    if (failed && published) return "partial";
    if (failed) return "failed";
    if (targetStatuses.includes("publishing")) return "publishing";
    if (targetStatuses.includes("scheduled")) return "scheduled";
    return "published";
  }

  switch (postStatus) {
    case "done":
      return "published";
    case "partial":
      return "partial";
    case "failed":
      return "failed";
    default:
      return "scheduled";
  }
}
