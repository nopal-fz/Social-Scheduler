# Status

Milestone: M0.2 selesai. Berikutnya M0.3 — auth satu owner.

## Done

- M0.1: Next.js 16.4.5 App Router, TypeScript strict, ESLint, Vitest, Zod env.
- `docker-compose.yml`: Postgres 17, volume persisten `jadwalin-postgres-data`, healthcheck, port host **5433**.
  Port 5432 sudah dipakai Postgres lokal mesin dev, jadi container memakai 5433 dan service lokal tidak disentuh.
- Drizzle: `drizzle.config.ts`, `lib/db/schema.ts`, `lib/db/client.ts` (pool di-cache di `globalThis` saat development).
- Tabel: `users`, `social_accounts`, `posts`, `post_targets`. UUID id, `timestamptz`, status `text` sesuai PRD.
- Migration `drizzle/0000_gigantic_multiple_man.sql` di-commit dan sudah diterapkan ke database dev.
- `lib/env.ts` memakai `getEnv()` lazy; `DATABASE_URL` required. Test tidak bergantung pada `.env`.
- Worker `worker/index.ts` (pg-boss, queue `heartbeat`) + `worker/ping.ts` untuk enqueue sekali.
- Script: `db:generate`, `db:migrate`, `worker`, `worker:ping`.
- Verifikasi lolos: container healthy, `pnpm db:migrate`, satu heartbeat di-enqueue dan dikonsumsi sekali,
  `pnpm typecheck`, `pnpm lint`, `pnpm test` (3 test), `pnpm build`.

## Next: M0.3

1. Auth satu owner (session cookie) tanpa registrasi; seed user lewat script/manual.
2. Rate limit endpoint login dan CSRF untuk mutation.
3. Setelah auth stabil, port layar kalender dari `design/calendar-week.html` ke Next.js (satu screen per run, ikut `docs/design.md`).

## Decisions

- App pribadi single-owner; tidak ada registrasi.
- Postgres development lewat Docker Compose di port **5433** karena 5432 dipakai Postgres lokal.
- Kredensial Docker Compose hanya untuk development; `.env.local` tidak di-commit.
- Queue memakai pg-boss di database yang sama; tanpa Redis. pg-boss membuat schema sendiri.
- Job heartbeat no-op sehingga aman dijalankan ulang; idempotency publish nyata diuji di M1.
- Waktu disimpan UTC; tampilan `Asia/Jakarta` nanti.
- M0.2 tidak menyentuh auth, UI kalender, atau platform.

## Files

- DB: `docker-compose.yml`, `drizzle.config.ts`, `drizzle/`, `lib/db/schema.ts`, `lib/db/client.ts`.
- Worker: `worker/index.ts`, `worker/ping.ts`.
- Env: `lib/env.ts`, `lib/env.test.ts`, `.env.example`.

## Commands

`pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm db:generate`, `pnpm db:migrate`, `pnpm worker`, `pnpm worker:ping`.

Urutan development:

```bash
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
pnpm worker        # terminal terpisah
pnpm worker:ping   # enqueue satu heartbeat
```

## Do not

- Jangan commit `.env`, token, atau password.
- Jangan force push.
- Jangan mengganti style di `docs/design.md`.
- Jangan pakai port 5432 untuk container; itu Postgres lokal user.
- Jangan ubah `app/page.tsx` jadi layar kalender sebelum auth M0.3.

## Handoff

- Mulai dari working tree bersih dan `origin/main`.
- Baca `AGENTS.md`, `PRD.md`, `docs/status.md`, lalu guide Next 16 yang relevan di `node_modules/next/dist/docs/` sebelum menulis kode.
- Satu sesi = satu slice. Akhiri dengan update file ini, commit, dan push.
