# Status

Milestone: M0.1 selesai. Berikutnya M0.2 — database + worker.

## Done

- Next.js 16.4.5 App Router, TypeScript strict, ESLint, Vitest.
- Zod env minimal (`lib/env.ts`) + `.env.example`; `.env*` diabaikan.
- pnpm 12.16.1, Node 24, Docker 27, psql 17.
- Git aktif dan sinkron dengan `origin/main`.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (2 test), `pnpm build`, dan `pnpm dev` HTTP 200 lolos.
- `docs/status.md` menjadi satu-satunya file status bergulir.
- `AGENTS.md` sudah memuat command aktual dan aturan Next 16 dari `next dev`.
- Style desain tetap terkunci di `docs/design.md`.

## Next: M0.2

1. Buat `docker-compose.yml` untuk Postgres 17: volume persisten, healthcheck, port development.
2. Tambah `DATABASE_URL` ke `.env.example` (placeholder saja).
3. Tambah Drizzle (`drizzle-orm`, `drizzle-kit`, `pg`), `drizzle.config.ts`, `lib/db/schema.ts`, dan `lib/db/client.ts`.
4. Schema minimal: `users`, `social_accounts`, `posts`, `post_targets`. Tabel media/komen/metrics menyusul.
5. Tambah script `db:generate`, `db:migrate`, dan `worker`.
6. Buat `worker/index.ts` sebagai proses terpisah dengan pg-boss dan satu job dummy yang idempotent.
7. Verifikasi: `docker compose up -d`, migrasi, job dummy jalan, `typecheck`, `lint`, `test`, `build`.
8. Update status, commit, push.

## Decisions

- App pribadi single-owner; auth satu user baru di M0.3. Tidak ada registrasi.
- Database development memakai Docker Compose.
- Queue memakai pg-boss; jangan tambah Redis.
- M0.2 tidak menyentuh auth, UI kalender, atau platform.
- Waktu disimpan UTC; tampilan tetap `Asia/Jakarta` nanti.

## Files

- Sudah ada: `app/`, `lib/env.ts`, `.env.example`, `README.md`, `docs/status.md`.
- Akan ditambah: `docker-compose.yml`, `drizzle.config.ts`, `lib/db/`, `worker/`.

## Commands

Sekarang: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.

M0.2: `pnpm db:generate`, `pnpm db:migrate`, `pnpm worker`.

## Do not

- Jangan port layar kalender, membuat auth, atau integrasi platform di M0.2.
- Jangan commit `.env`, token, atau password.
- Jangan force push.
- Jangan mengganti style di `docs/design.md`.

## Handoff

- Mulai dari working tree bersih dan `origin/main`.
- Baca `AGENTS.md`, `PRD.md`, `docs/status.md`, lalu guide Next 16 yang relevan di `node_modules/next/dist/docs/` sebelum menulis kode.
- Satu sesi = satu slice. Akhiri dengan update file ini, commit, dan push.
