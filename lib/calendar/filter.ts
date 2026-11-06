// Filter akun kalender: query param `?accounts=<id>,<id>` adalah sumber kebenaran.
// Tanpa param (null) = semua akun aktif. Param ada = hanya id yang dikenal.
// Set kosong = tidak ada akun dipilih. Param berisi id asing di-normalisasi
// (id tidak dikenal dibuang) sesuai pola parse date param di week.ts.

import type { CalendarPost } from "./types";

export function parseAccountsParam(
  value: string | string[] | undefined | null,
  validIds: Iterable<string>,
): Set<string> | null {
  if (value === undefined || value === null) {
    return null;
  }

  const valid = new Set(validIds);
  const rawParts = Array.isArray(value) ? value : [value];
  const selected = new Set<string>();

  for (const part of rawParts) {
    for (const id of part.split(",")) {
      const trimmed = id.trim();
      if (trimmed && valid.has(trimmed)) {
        selected.add(trimmed);
      }
    }
  }

  return selected;
}

// Serialize kanonis: semua akun terpilih = tanpa param; subset = daftar
// id urut sesuai daftar akun; tidak ada akun = string kosong (`accounts=`).
export function serializeAccountsParam(
  selected: Set<string> | null,
  allIds: string[],
): string | null {
  if (selected === null) {
    return null;
  }
  if (selected.size === 0) {
    return "";
  }
  if (allIds.every((id) => selected.has(id))) {
    return null;
  }
  return allIds.filter((id) => selected.has(id)).join(",");
}

export function toggleAccountInSelection(
  selected: Set<string> | null,
  accountId: string,
  allIds: string[],
): Set<string> {
  const next = new Set(selected ?? allIds);
  if (next.has(accountId)) {
    next.delete(accountId);
  } else {
    next.add(accountId);
  }
  return next;
}

// Post tampil kalau minimal satu targetnya terpilih. Post tanpa target
// tidak punya akun, jadi tersembunyi saat filter eksplisit per akun.
export function filterPostsByAccounts(
  posts: CalendarPost[],
  selected: Set<string> | null,
): CalendarPost[] {
  if (selected === null) {
    return posts;
  }
  return posts.filter((post) => post.targets.some((id) => selected.has(id)));
}

export function countPostsByAccount(posts: CalendarPost[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const target of post.targets) {
      counts.set(target, (counts.get(target) ?? 0) + 1);
    }
  }
  return counts;
}

export type CalendarHrefOptions = {
  week?: string | null;
  day?: number | null;
  accounts?: string | null;
  compose?: boolean;
  saved?: boolean;
};

export function buildCalendarHref({
  week,
  day,
  accounts,
  compose,
  saved,
}: CalendarHrefOptions): string {
  const parts: string[] = [];
  if (week) {
    parts.push(`week=${week}`);
  }
  if (day !== null && day !== undefined) {
    parts.push(`day=${day}`);
  }
  // String kosong tetap disimpan (`accounts=`) supaya "semua disembunyikan"
  // berbeda dari "semua dipilih" (tanpa param).
  if (accounts !== null && accounts !== undefined) {
    parts.push(`accounts=${accounts}`);
  }
  if (compose) {
    parts.push("compose=1");
  }
  if (saved) {
    parts.push("saved=1");
  }
  return parts.length > 0 ? `/?${parts.join("&")}` : "/";
}
