import { requireUser } from "@/lib/auth/current-user";
import { SAMPLE_POSTS } from "@/lib/calendar/sample-data";
import {
  addDays,
  dayIndex,
  getZonedNow,
  parseDateParam,
  startOfWeek,
  toIsoDate,
} from "@/lib/calendar/week";

import { CalendarView } from "./calendar-view";
import "./calendar.css";

export const instant = false;

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const query = await searchParams;

  const now = getZonedNow(new Date());
  const currentWeek = startOfWeek(now.date);
  const requestedWeek = typeof query.week === "string" ? parseDateParam(query.week) : null;
  const weekStart = requestedWeek ? startOfWeek(requestedWeek) : currentWeek;
  const isCurrentWeek = toIsoDate(weekStart) === toIsoDate(currentWeek);

  const todayIndex = dayIndex(weekStart, now.date);
  const requestedDay =
    typeof query.day === "string" && /^[0-6]$/.test(query.day) ? Number(query.day) : null;

  return (
    <CalendarView
      email={user.email}
      weekStart={weekStart}
      weekDates={Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))}
      todayIndex={todayIndex}
      nowMinutes={isCurrentWeek ? now.minutes : null}
      posts={isCurrentWeek ? SAMPLE_POSTS : []}
      selectedDay={requestedDay ?? todayIndex ?? 0}
    />
  );
}
