import type { CalendarPostStatus } from "@/lib/calendar/types";

export function StatusShape({ status }: { status: CalendarPostStatus }) {
  return <span className={`shape shape--${status}`} aria-hidden="true" />;
}
