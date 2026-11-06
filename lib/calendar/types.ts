import type { Platform } from "@/lib/db/schema";

export type CalendarPostStatus =
  | "scheduled"
  | "publishing"
  | "published"
  | "partial"
  | "failed";

export type CalendarAccount = {
  id: string;
  platform: Platform;
  label: string;
  handle: string;
  short: string;
  needsReconnect: boolean;
};

export type CalendarPost = {
  id: string;
  day: number;
  time: string;
  targets: string[];
  status: CalendarPostStatus;
  caption: string;
  error?: string;
};
