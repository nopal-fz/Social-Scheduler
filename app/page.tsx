import { requireUser } from "@/lib/auth/current-user";
import {
  countPostsByAccount,
  filterPostsByAccounts,
  parseAccountsParam,
  serializeAccountsParam,
} from "@/lib/calendar/filter";
import { getCalendarData } from "@/lib/calendar/posts";
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

  const { accounts, posts } = await getCalendarData(user.id, weekStart);

  const allIds = accounts.map((account) => account.id);
  const rawAccounts =
    typeof query.accounts === "string" || Array.isArray(query.accounts)
      ? query.accounts
      : undefined;
  const parsedSelection = parseAccountsParam(rawAccounts, allIds);
  // `?accounts=<semua id>` dinormalisasi ke tanpa param (semua dipilih).
  const selected =
    parsedSelection !== null &&
    serializeAccountsParam(parsedSelection, allIds) === null
      ? null
      : parsedSelection;
  const accountsParam =
    selected === null ? null : serializeAccountsParam(selected, allIds);

  const visiblePosts = filterPostsByAccounts(posts, selected);

  return (
    <CalendarView
      email={user.email}
      accounts={accounts}
      weekStart={weekStart}
      weekDates={Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))}
      todayIndex={todayIndex}
      nowMinutes={isCurrentWeek ? now.minutes : null}
      posts={posts}
      visiblePosts={visiblePosts}
      selectedAccountIds={selected === null ? null : [...selected]}
      accountsParam={accountsParam}
      countsByAccount={Object.fromEntries(countPostsByAccount(posts))}
      selectedDay={requestedDay ?? todayIndex ?? 0}
      compose={query.compose === "1"}
      saved={query.saved === "1"}
    />
  );
}
