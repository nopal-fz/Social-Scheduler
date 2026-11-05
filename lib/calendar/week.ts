export const DISPLAY_TIME_ZONE = "Asia/Jakarta";
export const ROW_HEIGHT = 44;
export const GRID_START_MINUTES = 6 * 60;
export const GRID_END_MINUTES = 23 * 60;

const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
export const DAYS_FULL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

const zonedFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DISPLAY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function toUtcMs(date: CivilDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function fromUtcMs(ms: number): CivilDate {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function addDays(date: CivilDate, days: number): CivilDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

export function getZonedNow(now: Date): { date: CivilDate; minutes: number } {
  const parts = zonedFormatter.formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    date: { year: value("year"), month: value("month"), day: value("day") },
    minutes: value("hour") * 60 + value("minute"),
  };
}

export function startOfWeek(date: CivilDate): CivilDate {
  const weekday = new Date(toUtcMs(date)).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

export function parseDateParam(value: string | undefined): CivilDate | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [year, month, day] = match.slice(1).map(Number);
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = { year, month, day };
  return toIsoDate(fromUtcMs(toUtcMs(date))) === toIsoDate(date) ? date : null;
}

export function toIsoDate(date: CivilDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function dayIndex(weekStart: CivilDate, date: CivilDate): number | null {
  const index = Math.round((toUtcMs(date) - toUtcMs(weekStart)) / DAY_MS);
  return index >= 0 && index <= 6 ? index : null;
}

export function weekdayIndex(date: CivilDate): number {
  return (new Date(toUtcMs(date)).getUTCDay() + 6) % 7;
}

export function formatWeekRange(weekStart: CivilDate): string {
  const start = weekStart;
  const end = addDays(weekStart, 6);

  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${MONTHS[start.month - 1]} ${end.year}`;
  }
  if (start.year === end.year) {
    return `${start.day} ${MONTHS[start.month - 1]} – ${end.day} ${MONTHS[end.month - 1]} ${end.year}`;
  }
  return `${start.day} ${MONTHS[start.month - 1]} ${start.year} – ${end.day} ${MONTHS[end.month - 1]} ${end.year}`;
}

export function formatAgendaDate(date: CivilDate): string {
  return `${DAYS_FULL[weekdayIndex(date)]}, ${date.day} ${MONTHS_FULL[date.month - 1]}`;
}

export function slotTop(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`invalid time: ${time}`);
  }
  return ((hour * 60 + minute - GRID_START_MINUTES) / 30) * ROW_HEIGHT;
}

export function nowTop(minutes: number): number {
  return slotTop(formatClock(minutes));
}

export function formatClock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function isGridTime(minutes: number): boolean {
  return minutes >= GRID_START_MINUTES && minutes <= GRID_END_MINUTES;
}
