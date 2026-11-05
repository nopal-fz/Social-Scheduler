# Status

Milestone: M0.4 — shell kalender minggu selesai dengan data contoh. Berikutnya query DB dan interaksi kalender.

## Done

- M0.1: Next.js 16.4.5 App Router, TypeScript strict, ESLint, Vitest, Zod env.
- M0.2: Postgres 17 via Docker Compose, Drizzle schema, migration, worker pg-boss.
- M0.3: auth satu owner.
  - `users` dipakai untuk kredensial; tidak ada registrasi.
  - Password disimpan sebagai hash scrypt (`node:crypto`) dengan salt acak.
  - Session cookie `jadwalin_session`: HMAC-SHA256, `httpOnly`, `sameSite=lax`, `secure` di production, umur 7 hari.
  - `proxy.ts` (Next 16, Node runtime) mengarahkan request tanpa session valid ke `/login`; halaman tetap memverifikasi token dan user di database.
  - `/login` dan `/` dinamis; form login bekerja dengan server action. Error login generik.
  - Rate limit login 5 percobaan / 15 menit per email, disimpan in-memory.
  - `pnpm db:seed` membuat atau memperbarui owner dari `OWNER_EMAIL` / `OWNER_PASSWORD`.
- Verifikasi produksi (`pnpm build` + `pnpm start`):
  - `GET /` tanpa cookie → 307 ke `/login`; login benar → `/`; logout → `/login`.
  - Cookie sesi `httpOnly`, `secure`, `sameSite=Lax`.
  - Password salah menampilkan pesan generik; percobaan ke-6 kena rate limit.
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` (15 test), `pnpm build` lolos.
  - Screenshot login 1440/1024/768/390: tanpa overflow, font termuat, fokus keyboard terlihat, console bersih.
- M0.4: shell kalender minggu di `/`, hasil port `design/calendar-week.html`.
  - Server Component; week start, tanggal, dan posisi blok dihitung di server dengan timezone tampilan `Asia/Jakarta`.
  - Navigasi minggu lewat `?week=YYYY-MM-DD`; pilih hari mobile lewat `?day=0..6`. Tombol "Hari ini" kembali ke minggu berjalan.
  - Grid 7 hari, rail akun, chip akun tablet, agenda mobile, legend status, now line, dan status reconnect.
  - Data masih contoh dari `lib/calendar/sample-data.ts`; minggu lain tampil kosong.
  - Belum ada filter akun, drawer, drag, atau tombol post baru.
- Verifikasi M0.4 (`pnpm build` + `pnpm start`):
  - Screenshot 1440/1024/768/390: tanpa overflow, header hari sejajar dengan kolom, font termuat, console bersih.
  - 21 blok tidak keluar dari kolom; scroll awal mengikuti jam sekarang; navigasi minggu dan hari mobile bekerja.
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` (25 test), `pnpm build` lolos.

## Next: M0.5 / M1

1. Ganti data contoh dengan query `posts` + `post_targets` dan seed post uji.
2. Interaksi kalender: filter akun, drawer detail/composer, drag dengan jalur keyboard, tombol post baru.
3. Setelah itu masuk M1: Threads end-to-end (teks dulu).

## Decisions

- App pribadi single-owner; tidak ada registrasi.
- Auth memakai tabel `users`, scrypt, dan cookie bertanda tangan. Tanpa library auth baru.
- Rate limit in-memory per proses; cukup untuk satu instance. Pindah ke Postgres bila app dijalankan lebih dari satu instance.
- CSRF mengandalkan origin check bawaan Server Actions Next.js; tidak ada route handler mutation.
- Kalender memakai query param untuk minggu/hari, bukan state client, supaya tetap server-rendered.
- Sampel kalender statis sampai query post nyata ada; minggu lain sengaja kosong.
- Postgres development lewat Docker Compose di port **5433** karena 5432 dipakai Postgres lokal.
- Queue memakai pg-boss di database yang sama; tanpa Redis.
- Waktu disimpan UTC; tampilan `Asia/Jakarta` nanti.
- Style tetap terkunci di `docs/design.md`.

## Files

- Auth: `lib/auth/`, `app/login/`, `app/actions.ts`, `proxy.ts`.
- Kalender: `app/page.tsx`, `app/calendar-view.tsx`, `app/calendar.css`, `app/scroll-to-now.tsx`, `lib/calendar/`.
- DB: `docker-compose.yml`, `drizzle.config.ts`, `drizzle/`, `lib/db/`.
- Worker: `worker/index.ts`, `worker/ping.ts`.
- Seed: `scripts/seed-owner.ts`.
- Env: `lib/env.ts`, `lib/env.test.ts`, `.env.example`.

## Commands

`pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm worker`, `pnpm worker:ping`.

Urutan setup:

```bash
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Do not

- Jangan commit `.env`, token, password, atau hash asli.
- Jangan force push.
- Jangan mengganti style di `docs/design.md`.
- Jangan pakai port 5432 untuk container; itu Postgres lokal user.
- Jangan menambah registrasi atau multi-user flow.
- Jangan menganggap blok kalender sudah bisa diklik atau di-drag; interaksi itu belum dibuat.

## Handoff

- Mulai dari working tree bersih dan `origin/main`.
- Baca `AGENTS.md`, `PRD.md`, `docs/status.md`, lalu guide Next 16 yang relevan di `node_modules/next/dist/docs/` sebelum menulis kode.
- Satu sesi = satu slice. Akhiri dengan update file ini, commit, dan push.
