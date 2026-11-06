import Link from "next/link";

import {
  DAYS,
  addDays,
  formatAgendaDate,
  formatClock,
  formatWeekRange,
  isGridTime,
  nowTop,
  slotTop,
  toIsoDate,
  type CivilDate,
} from "@/lib/calendar/week";
import { LEGEND_ORDER, STATUS_LABELS } from "@/lib/calendar/status";
import type {
  CalendarAccount,
  CalendarPost,
  CalendarPostStatus,
} from "@/lib/calendar/types";
import type { Platform } from "@/lib/db/schema";

import { logout } from "./actions";
import { platformPaths } from "./platform-paths";
import { GridScroll } from "./scroll-to-now";

type CalendarViewProps = {
  email: string;
  accounts: CalendarAccount[];
  weekStart: CivilDate;
  weekDates: CivilDate[];
  todayIndex: number | null;
  nowMinutes: number | null;
  posts: CalendarPost[];
  selectedDay: number;
};

function initials(email: string): string {
  const [name = ""] = email.split("@");
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

function PlatformMark({ platform }: { platform: Platform }) {
  return (
    <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d={platformPaths[platform]} />
    </svg>
  );
}

function ReconnectMark() {
  return (
    <svg className="mark-warn" viewBox="0 0 8 8" aria-hidden="true">
      <path
        d="M4 .6 7.7 7.4H.3Z"
        fill="currentColor"
        stroke="#fff"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusShape({ status }: { status: CalendarPostStatus }) {
  return <span className={`shape shape--${status}`} aria-hidden="true" />;
}

function Targets({
  targets,
  className,
  accountsById,
}: {
  targets: string[];
  className: string;
  accountsById: Map<string, CalendarAccount>;
}) {
  return (
    <span className={className}>
      {targets.map((id) => {
        const account = accountsById.get(id);
        if (!account) return null;
        return (
          <span
            key={id}
            className="markwrap"
            title={`${account.label} ${account.handle}`}
          >
            <PlatformMark platform={account.platform} />
            {account.needsReconnect ? <ReconnectMark /> : null}
          </span>
        );
      })}
    </span>
  );
}

function postLabel(
  post: CalendarPost,
  date: CivilDate,
  accountsById: Map<string, CalendarAccount>,
): string {
  const names = post.targets
    .map((id) => {
      const account = accountsById.get(id);
      if (!account) return null;
      return `${account.label} ${account.handle}${account.needsReconnect ? " perlu reconnect" : ""}`;
    })
    .filter(Boolean)
    .join(", ");

  return `${formatAgendaDate(date)}, ${post.time}, ${names}, ${STATUS_LABELS[post.status]}. ${post.caption}${
    post.error ? ` ${post.error}` : ""
  }`;
}

function PreviousIcon() {
  return (
    <svg className="ic" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M9.75 3.5 5.25 8l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg className="ic" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6.25 3.5 10.75 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarView({
  email,
  accounts,
  weekStart,
  weekDates,
  todayIndex,
  nowMinutes,
  posts,
  selectedDay,
}: CalendarViewProps) {
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const reconnectAccount = accounts.find((account) => account.needsReconnect);

  const countFor = (accountId: string) =>
    posts.filter((post) => post.targets.includes(accountId)).length;
  const postsForDay = (day: number) =>
    posts
      .filter((post) => post.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));

  const nowLineTop =
    todayIndex !== null && nowMinutes !== null && isGridTime(nowMinutes)
      ? nowTop(nowMinutes)
      : null;
  const prevWeek = toIsoDate(addDays(weekStart, -7));
  const nextWeek = toIsoDate(addDays(weekStart, 7));
  const selectedDate = weekDates[selectedDay];
  const agendaPosts = postsForDay(selectedDay);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">jadwalin</span>
          <span className="brand__sep" aria-hidden="true" />
          <span className="brand__page">Kalender</span>
        </div>
        <div className="topbar__actions">
          <form action={logout} className="topbar__logout">
            <button
              type="submit"
              className="avatar"
              aria-label={`Keluar dari ${email}`}
              title="Keluar"
            >
              {initials(email)}
            </button>
          </form>
        </div>
      </header>

      <div className="workspace">
        <aside className="rail" aria-label="Akun">
          <div className="rail__head">
            <h2>Akun</h2>
            <span className="rail__count mono">{accounts.length}</span>
          </div>
          <div className="rail__list">
            {accounts.map((account) => (
              <div key={account.id} className="acct">
                <span className="acct__mark">
                  <PlatformMark platform={account.platform} />
                </span>
                <span className="acct__handle">{account.handle}</span>
                {account.needsReconnect ? (
                  <span className="acct__warn" title="Perlu reconnect" />
                ) : null}
                <span className="acct__n mono">{countFor(account.id)}</span>
              </div>
            ))}
            {reconnectAccount ? (
              <div className="acct-note">
                <p>
                  <b>Token {reconnectAccount.label} kedaluwarsa.</b> Post ke akun ini tidak
                  akan terbit sampai disambungkan.
                </p>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="content">
          <div className="accountbar" aria-label="Akun">
            <span className="chip chip--all is-on">
              <span>Semua</span>
              <span className="chip__n mono">{posts.length}</span>
            </span>
            {accounts.map((account) => (
              <span
                key={account.id}
                className="chip is-on"
                title={`${account.label} ${account.handle}`}
              >
                <PlatformMark platform={account.platform} />
                <span className="chip__handle">{account.handle}</span>
                <span className="chip__short">{account.short}</span>
                <span className="chip__n mono">{countFor(account.id)}</span>
                {account.needsReconnect ? (
                  <span className="acct__warn" title="Perlu reconnect" />
                ) : null}
              </span>
            ))}
          </div>

          {reconnectAccount ? (
            <div className="reconnect-strip">
              <p>
                <b>{reconnectAccount.label} perlu reconnect.</b> Post ke akun ini tidak akan
                terbit sampai disambungkan.
              </p>
            </div>
          ) : null}

          <div className="toolbar">
            <div className="toolbar__left">
              <Link className="btn btn--quiet btn--sm" href="/">
                Hari ini
              </Link>
              <div className="navgroup">
                <Link
                  className="icon-btn"
                  href={`/?week=${prevWeek}`}
                  aria-label="Minggu sebelumnya"
                >
                  <PreviousIcon />
                </Link>
                <Link
                  className="icon-btn"
                  href={`/?week=${nextWeek}`}
                  aria-label="Minggu berikutnya"
                >
                  <NextIcon />
                </Link>
              </div>
              <h1 className="week-range">{formatWeekRange(weekStart)}</h1>
            </div>
            <div className="toolbar__right">
              <span className="tz mono">Asia/Jakarta</span>
            </div>
          </div>

          <div className="subbar">
            <p className="summary">
              {posts.length > 0 ? (
                <>
                  <b>{posts.length}</b> post minggu ini
                </>
              ) : (
                "Belum ada post minggu ini."
              )}
            </p>
            {posts.length > 0 ? (
              <ul className="legend" aria-label="Status post">
                {LEGEND_ORDER.map((status) => (
                  <li key={status}>
                    <StatusShape status={status} />
                    <span>{STATUS_LABELS[status]}</span>
                    <span className="n mono">
                      {posts.filter((post) => post.status === status).length}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid">
            <div className="grid__head">
              <div className="gutter-head" />
              {weekDates.map((date, index) => (
                <div
                  key={toIsoDate(date)}
                  className={`dayhead${index === todayIndex ? " is-today" : ""}`}
                >
                  <span className="dayhead__dow">{DAYS[index]}</span>
                  <span className="dayhead__num">{date.day}</span>
                  <span className="dayhead__count mono">{postsForDay(index).length} post</span>
                </div>
              ))}
            </div>

            <div className="grid__body" id="grid-body">
              <div className="gutter" aria-hidden="true">
                {Array.from({ length: 18 }, (_, offset) => 6 + offset).map((hour) => {
                  const minutes = hour * 60;
                  if (nowMinutes !== null && Math.abs(minutes - nowMinutes) < 25) {
                    return null;
                  }
                  return (
                    <span
                      key={hour}
                      className="gutter__h mono"
                      style={{ top: slotTop(`${hour}:00`) + 3 }}
                    >
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  );
                })}
              </div>

              {weekDates.map((date, index) => {
                const isToday = index === todayIndex;
                return (
                  <div
                    key={toIsoDate(date)}
                    className={`daycol${isToday ? " is-today" : ""}`}
                  >
                    {postsForDay(index).map((post) => (
                      <article
                        key={post.id}
                        className={`block st--${post.status}`}
                        style={{ top: slotTop(post.time) + 2 }}
                        aria-label={postLabel(post, date, accountsById)}
                        title={post.error ? `${post.caption}\n${post.error}` : post.caption}
                      >
                        <span className="block__time mono">{post.time}</span>
                        <span className="block__sep" />
                        <span className="block__caption">{post.caption}</span>
                        <span className="block__meta">
                          <Targets
                            targets={post.targets}
                            className="block__marks"
                            accountsById={accountsById}
                          />
                          <span className="block__status">
                            <StatusShape status={post.status} />
                          </span>
                        </span>
                      </article>
                    ))}
                    {isToday && nowLineTop !== null ? (
                      <span className="nowdot" style={{ top: nowLineTop }} />
                    ) : null}
                  </div>
                );
              })}

              {nowLineTop !== null && nowMinutes !== null ? (
                <div className="nowline" style={{ top: nowLineTop }}>
                  <span className="nowline__label mono">{formatClock(nowMinutes)}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mobile">
            <div className="daystrip" aria-label="Pilih hari">
              {weekDates.map((date, index) => (
                <Link
                  key={toIsoDate(date)}
                  className={`daychip${index === todayIndex ? " is-today" : ""}${
                    index === selectedDay ? " is-on" : ""
                  }`}
                  href={`/?week=${toIsoDate(weekStart)}&day=${index}`}
                  aria-current={index === selectedDay ? "date" : undefined}
                >
                  <span className="daychip__dow">{DAYS[index]}</span>
                  <span className="daychip__n">{date.day}</span>
                  <span className="daychip__c mono">{postsForDay(index).length}</span>
                </Link>
              ))}
            </div>

            <div className="agenda">
              <div className="agenda__head">
                <h2>{formatAgendaDate(selectedDate)}</h2>
                <span className="mono">{agendaPosts.length} post</span>
              </div>
              <div className="agenda__list">
                {agendaPosts.length > 0 ? (
                  agendaPosts.map((post) => (
                    <article
                      key={post.id}
                      className={`agenda-row st--${post.status}`}
                      aria-label={postLabel(post, selectedDate, accountsById)}
                    >
                      <span className="agenda-row__time mono">{post.time}</span>
                      <span className="agenda-row__sep" />
                      <span className="agenda-row__body">
                        <span className="agenda-row__caption">{post.caption}</span>
                        <span className="agenda-row__meta">
                          <Targets
                            targets={post.targets}
                            className="agenda-row__marks"
                            accountsById={accountsById}
                          />
                          <span className="agenda-row__status">
                            <StatusShape status={post.status} />
                            {STATUS_LABELS[post.status]}
                          </span>
                        </span>
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="agenda-empty">Belum ada post hari ini.</p>
                )}
              </div>
            </div>
          </div>

          <GridScroll top={nowLineTop} />
        </main>
      </div>
    </div>
  );
}
