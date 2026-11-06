# Status

Milestone: M0.5 — kalender membaca post dari database. Berikutnya interaksi kalender (filter akun, drawer, drag).

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
- M0.5: kalender membaca `posts`, `post_targets`, dan `social_accounts` dari Postgres.
  - `getCalendarData` menjalankan dua query paralel per request: akun milik user, dan post dalam rentang minggu (join target). Tidak ada N+1 dan tidak ada kolom token yang dipilih.
  - Rentang minggu dihitung dari Senin 00:00 sampai Senin berikutnya 00:00 `Asia/Jakarta`, dikonversi ke UTC (`jakartaWeekRangeUtc`). Waktu tampil tetap `Asia/Jakarta`.
  - Status post diturunkan dari target dengan prioritas `failed > partial > publishing > scheduled > published`; status level post (`done`/`partial`/`failed`) dipakai saat post belum punya target. Mapper murni di `lib/calendar/status.ts`.
  - `scripts/seed-posts.ts` membuat 4 akun placeholder dan 21 post uji untuk minggu berjalan. Idempotent: kalau minggu itu sudah punya post, seed dilewati. Token akun hanya placeholder `seed-placeholder-not-a-token`.
  - `lib/calendar/sample-data.ts` dihapus; fixture pindah ke `scripts/seed-data.ts`.
  - Empty state minggu kosong tetap: ringkasan "Belum ada post minggu ini." dan agenda "Belum ada post hari ini."
  - Verifikasi M0.5 (`pnpm build` + `pnpm start`, sesi login owner):
    - 21 blok tampil, 4 akun di rail/chip, agenda hari ini 3 post, legend 10 terjadwal / 1 sedang terbit / 7 terbit / 1 sebagian / 2 gagal.
    - Screenshot 1440/1024/768/390: tanpa overflow horizontal, header hari sejajar kolom, font termuat, console bersih, fokus keyboard terlihat (outline 2px).
    - `pnpm typecheck`, `pnpm lint`, `pnpm test` (29 test), `pnpm build` lolos.

## Next: interaksi kalender / M1

1. Interaksi kalender: filter akun dulu. Drawer detail/composer, drag dengan jalur keyboard, dan tombol post baru jadi slice terpisah.
2. Setelah itu masuk M1: Threads end-to-end (teks dulu). Tulis `docs/threads.md` dan selesaikan item `[VERIFY]` sebelum integrasi.

## Decisions

- App pribadi single-owner; tidak ada registrasi.
- Auth memakai tabel `users`, scrypt, dan cookie bertanda tangan. Tanpa library auth baru.
- Rate limit in-memory per proses; cukup untuk satu instance. Pindah ke Postgres bila app dijalankan lebih dari satu instance.
- CSRF mengandalkan origin check bawaan Server Actions Next.js; tidak ada route handler mutation.
- Kalender memakai query param untuk minggu/hari, bukan state client, supaya tetap server-rendered.
- Kalender sekarang membaca database untuk semua minggu; minggu tanpa post menampilkan empty state.
- Status blok diturunkan dari `post_targets` (prioritas desain), bukan dari `posts.status`; status post hanya fallback saat belum ada target.
- Query kalender hanya memilih kolom yang dibutuhkan UI; token akun tidak pernah ikut ke halaman.
- Seed post dev memakai akun placeholder dan idempotent per minggu; aman dijalankan ulang.
- Postgres development lewat Docker Compose di port **5433** karena 5432 dipakai Postgres lokal.
- Queue memakai pg-boss di database yang sama; tanpa Redis.
- Waktu disimpan UTC; tampilan `Asia/Jakarta`.
- Style tetap terkunci di `docs/design.md`.

## Files

- Auth: `lib/auth/`, `app/login/`, `app/actions.ts`, `proxy.ts`.
- Kalender: `app/page.tsx`, `app/calendar-view.tsx`, `app/calendar.css`, `app/scroll-to-now.tsx`, `lib/calendar/`.
- Query + status: `lib/calendar/posts.ts`, `lib/calendar/status.ts`, `lib/calendar/types.ts`.
- DB: `docker-compose.yml`, `drizzle.config.ts`, `drizzle/`, `lib/db/`.
- Worker: `worker/index.ts`, `worker/ping.ts`.
- Seed: `scripts/seed-owner.ts`, `scripts/seed-posts.ts`, `scripts/seed-data.ts`.
- Env: `lib/env.ts`, `lib/env.test.ts`, `.env.example`.

## Commands

`pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:seed:posts`, `pnpm worker`, `pnpm worker:ping`.

Urutan setup:

```bash
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm db:seed:posts
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
