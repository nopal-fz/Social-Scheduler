import { z } from "zod";

import {
  dayIndex,
  formatClock,
  getZonedNow,
  jakartaToUtc,
  parseDateParam,
  startOfWeek,
  toIsoDate,
} from "../calendar/week";

// TODO(verify): Threads text limit, dikonfirmasi ke docs resmi di docs/threads.md saat M1.
export const CAPTION_LIMIT = 500;

const fieldsSchema = z.object({
  caption: z.string(),
  accountIds: z.array(z.string()),
  date: z.string(),
  time: z.string(),
});

export type ComposerInput = z.infer<typeof fieldsSchema>;

export type ComposerValues = {
  caption: string;
  accountIds: string[];
  scheduledAt: Date;
  weekStartIso: string;
  day: number;
};

export type ComposerResult =
  | { ok: true; value: ComposerValues }
  | { ok: false; error: string };

export function parseComposerInput(
  input: ComposerInput,
  options: { allowedAccountIds: Iterable<string>; now: Date },
): ComposerResult {
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Form tidak terbaca. Muat ulang halaman lalu coba lagi." };
  }

  const caption = parsed.data.caption.trim();
  if (!caption) {
    return { ok: false, error: "Tulis caption dulu." };
  }
  if (caption.length > CAPTION_LIMIT) {
    return {
      ok: false,
      error: `Caption ${caption.length} karakter. Maksimal ${CAPTION_LIMIT}, pendekkan dulu.`,
    };
  }

  const accountIds = [...new Set(parsed.data.accountIds)];
  if (accountIds.length === 0) {
    return { ok: false, error: "Pilih minimal satu akun." };
  }

  const allowed = new Set(options.allowedAccountIds);
  if (!accountIds.every((id) => allowed.has(id))) {
    return { ok: false, error: "Akun itu tidak tersedia. Muat ulang halaman lalu coba lagi." };
  }

  const date = parseDateParam(parsed.data.date);
  const match = /^(\d{2}):(\d{2})$/.exec(parsed.data.time);
  const hour = match ? Number(match[1]) : NaN;
  const minute = match ? Number(match[2]) : NaN;

  if (!date || !Number.isInteger(hour) || !Number.isInteger(minute) || hour > 23 || minute > 59) {
    return { ok: false, error: "Tanggal atau jam tidak valid." };
  }

  const scheduledAt = jakartaToUtc(date, hour * 60 + minute);
  if (scheduledAt.getTime() <= options.now.getTime()) {
    return { ok: false, error: "Waktu sudah lewat. Pilih waktu setelah sekarang." };
  }

  const weekStart = startOfWeek(getZonedNow(scheduledAt).date);

  return {
    ok: true,
    value: {
      caption,
      accountIds,
      scheduledAt,
      weekStartIso: toIsoDate(weekStart),
      day: dayIndex(weekStart, date) ?? 0,
    },
  };
}

// Waktu default composer: 15 menit terdekat setelah sekarang, maksimal 23:45.
export function nextQuarterHour(minutes: number): string {
  const rounded = Math.min(Math.ceil((minutes + 1) / 15) * 15, 23 * 60 + 45);
  return formatClock(rounded);
}
