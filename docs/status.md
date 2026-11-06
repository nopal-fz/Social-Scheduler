# Status

Milestone: M0.5 interaksi — filter akun dan composer "Post baru" selesai. Berikutnya drawer detail.

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
- M0.5 interaksi: filter akun kalender (`?accounts=<id>,<id>`).
  - Filter server-rendered; URL adalah sumber kebenaran, konsisten dengan `?week`/`?day`. Tanpa param = semua akun; `?accounts=` = tidak ada akun dipilih. Id asing dibuang saat parsing; memilih semua akun dinormalisasi kembali ke tanpa param.
  - Rail memakai checkbox native (`accent-color`, satu baris label per akun). Chip tablet/mobile memakai tombol toggle `aria-pressed` dengan garis bawah accent saat aktif. Chip "Semua" mengembalikan semua akun.
  - Filter diterapkan ke blok grid, agenda mobile, hitungan hari, ringkasan, dan legend. Hitungan per akun di rail/chip tetap total post akun itu (multi-target dihitung di setiap akunya). Post tanpa target tersembunyi saat filter eksplisit per akun.
  - Navigasi "Hari ini", minggu sebelumnya/berikutnya, dan hari mobile mempertahankan param filter.
  - Empty state dibedakan: semua akun dimatikan = "Semua akun disembunyikan." + aksi "Tampilkan semua akun"; minggu kosong tetap "Belum ada post minggu ini." / "Belum ada post hari ini."
  - Logika murni di `lib/calendar/filter.ts` + `filter.test.ts`; query database tidak diubah. `PlatformMark` dipindah ke `app/platform-mark.tsx` supaya dipakai komponen filter klien.
  - Verifikasi sesi ini (`pnpm build` + `pnpm start`, sesi login owner, script CDP temp di folder temp, tidak di-commit):
    - Screenshot 1440/1024/768/390 default: 21 blok, tanpa overflow horizontal, font termuat, console bersih.
    - Matikan 1 akun: URL bertambah `accounts=<3 id>`, blok menyusut 14, rail tetap total per akun, legend/ringkasan/hitungan hari mengikuti yang terlihat.
    - Maju minggu dengan filter aktif: `accounts` terbawa; "Hari ini" menghapus `week` tapi mempertahankan `accounts`.
    - Matikan semua: ringkasan "Semua akun disembunyikan." + aksi "Tampilkan semua akun", legend hilang, agenda mobile memesan yang sama, klik aksi mengembalikan 21 blok.
    - Fokus keyboard pada checkbox: ring 2px accent pada baris label; `accent-color` pada checkbox terverifikasi.
    - `pnpm typecheck`, `pnpm lint`, `pnpm test` (43 test), `pnpm build` lolos.
- M0.5 interaksi: composer "Post baru" menyimpan `posts` + `post_targets`.
  - Drawer dibuka dari tombol "Post baru" lewat URL `?compose=1`, ditutup lewat tombol close/Batal/Esc. `onClose` mengganti URL ke `closeHref` (tanpa `compose`), jadi state buka-tutup tetap server-rendered seperti `week`/`day`/`accounts`. Setelah simpan, redirect membawa `saved=1` untuk toast "Terjadwal".
  - Hanya akun **Threads** yang muncul dan bisa dipilih; caption teks saja. Media upload belum ada, jadi Instagram/TikTok belum bisa dijadwalkan dari composer.
  - Field: caption (counter `x/500`), checkbox akun (pra-terpilih dari filter akun aktif), tanggal, dan jam (`step=900`, 15 menit). Default tanggal = hari yang dipilih di kalender; default jam = kuartal jam berikutnya kalau hari ini, selain itu `09:00`.
  - Validasi di `lib/composer/schema.ts` (Zod untuk bentuk input, sisanya aturan murni): caption wajib dan ≤ `CAPTION_LIMIT`, minimal satu akun milik user, tanggal/jam valid, waktu harus setelah sekarang. `CAPTION_LIMIT = 500` masih `TODO(verify)` sampai `docs/threads.md` ditulis di M1.
  - Jam Jakarta dikonversi ke UTC lewat `jakartaToUtc`; yang disimpan UTC, yang ditampilkan `Asia/Jakarta`. Setelah simpan, kalender pindah ke minggu dan hari post itu, sambil membawa `accounts`.
  - Insert `posts` + `post_targets` (`content_type = 'text'`) dalam satu transaksi. Belum ada job pg-boss; ditandai komentar `shortcut:` di `createPost` dan disambungkan di M1 saat handler publish ada.
  - Drawer memakai `<dialog>` native + `showModal()` (Esc, focus trap, `::backdrop` gratis). Field dikendalikan state karena React 19 mereset form tak-terkontrol setelah server action, sehingga isian hilang saat validasi gagal. Submit lewat `onSubmit` → `startTransition(() => formAction(data))` untuk alasan yang sama.
  - Verifikasi sesi ini (`pnpm build` + `pnpm start`, sesi login owner, script CDP temp di folder temp, tidak di-commit):
    - Buka dari grid: dialog modal, `compose=1` di URL, 1 akun Threads pra-terpilih, tanggal hari ini, jam kuartal berikutnya, fokus awal di caption, `aria-labelledby` benar, counter `0/500`.
    - Validasi waktu lampau / caption kosong / tanpa akun: pesan `role="alert"` sesuai, drawer tetap terbuka, caption dan jam bertahan.
    - Simpan: 1 baris `posts` + 1 baris `post_targets`, `scheduled_at` tersimpan benar (22:30 Jakarta), dialog tertutup, `saved=1`, toast "Terjadwal" terlihat, blok muncul di grid, ringkasan naik jadi 22.
    - Esc menutup drawer dan menghapus `compose`; mobile 390 drawer selebar layar tanpa overflow; fokus keyboard Tab mendarat di caption dengan ring 2px accent; console bersih.
    - Data uji dihapus setelah verifikasi (21 post tersisa).
    - `pnpm typecheck`, `pnpm lint`, `pnpm test` (54 test), `pnpm build` lolos.

## Next: interaksi kalender / M1

1. Slice berikutnya: drawer detail post (baca caption, akun, waktu, status) + retry untuk post gagal. Retry baru bisa diuji setelah publisher M1 ada; kalau belum, tampilkan tombolnya nonaktif atau tunda slice retry.
2. Setelah itu drag + jalur keyboard untuk memindah jadwal. Tombol retry dan drag tetap slice terpisah, bukan digabung ke composer.
3. Setelah itu masuk M1: Threads end-to-end (teks dulu). Tulis `docs/threads.md` dan selesaikan item `[VERIFY]` sebelum integrasi.

## Decisions

- App pribadi single-owner; tidak ada registrasi.
- Auth memakai tabel `users`, scrypt, dan cookie bertanda tangan. Tanpa library auth baru.
- Rate limit in-memory per proses; cukup untuk satu instance. Pindah ke Postgres bila app dijalankan lebih dari satu instance.
- CSRF mengandalkan origin check bawaan Server Actions Next.js; tidak ada route handler mutation.
- Kalender memakai query param untuk minggu/hari, bukan state client, supaya tetap server-rendered. Filter akun memakai pola yang sama (`?accounts=`); komponen filter klien hanya menulis param lewat router, keputusan tampil tetap server-rendered.
- Kalender sekarang membaca database untuk semua minggu; minggu tanpa post menampilkan empty state.
- Status blok diturunkan dari `post_targets` (prioritas desain), bukan dari `posts.status`; status post hanya fallback saat belum ada target.
- Query kalender hanya memilih kolom yang dibutuhkan UI; token akun tidak pernah ikut ke halaman.
- Seed post dev memakai akun placeholder dan idempotent per minggu; aman dijalankan ulang.
- Postgres development lewat Docker Compose di port **5433** karena 5432 dipakai Postgres lokal.
- Queue memakai pg-boss di database yang sama; tanpa Redis.
- Filter akun memakai `?accounts=<id>,<id>`; tanpa param = semua akun, param kosong = tidak ada akun, id asing dibuang. Hitungan per akun tetap total (post multi-target dihitung di setiap akunya); summary/legend/hitungan hari memakai post yang terlihat; post tanpa target tersembunyi saat filter eksplisit.
- Composer dibuka lewat `?compose=1` dan hasil simpan lewat `?saved=1`, bukan state client, supaya pola URL tetap sama dengan navigasi kalender.
- Composer sementara hanya untuk akun Threads dan konten teks. Instagram/TikTok menunggu media upload (M2/M3); batas caption tunggal 500 (`TODO(verify)`), difinalkan di `docs/threads.md` saat M1.
- Simpan post belum membuat job publish; `createPost` hanya menulis DB dan menandai titik sambung pg-boss dengan komentar `shortcut:`.
- Form composer dikendalikan state dan disubmit manual (`onSubmit` + `startTransition`) karena React 19 mereset form tak-terkontrol setelah server action.
- Drawer memakai `<dialog>` native (`showModal`) untuk Esc, focus containment, dan backdrop tanpa JavaScript tambahan.
- Waktu disimpan UTC; tampilan `Asia/Jakarta`.
- Style tetap terkunci di `docs/design.md`.

## Files

- Auth: `lib/auth/`, `app/login/`, `app/actions.ts`, `proxy.ts`.
- Kalender: `app/page.tsx`, `app/calendar-view.tsx`, `app/calendar.css`, `app/scroll-to-now.tsx`, `lib/calendar/`.
- Filter akun: `lib/calendar/filter.ts` + `filter.test.ts`; komponen klien toggle di `app/account-filter.tsx`; `app/platform-mark.tsx` (mark platform bersama).
- Composer: `app/composer.tsx`, `app/actions.ts` (`createPost`), `lib/composer/schema.ts` + `schema.test.ts`, style drawer/toast/primary button di `app/calendar.css`.
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
