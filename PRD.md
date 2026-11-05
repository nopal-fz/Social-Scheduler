# PRD: Social Scheduler (working name: `jadwalin`)

Versi simpel dari tool scheduling sosmed ala eksis.io. Fokus: **jadwalin post, tarik komen, lihat analytics** untuk **Threads, Instagram, TikTok**. Cuma 3 platform, cuma fitur inti.

> Status: draft v0.1. Asumsi yang belum pasti ditandai `[VERIFY]` dan harus dicek ke docs resmi platform sebelum implementasi.

---

## 1. Tujuan

- Satu tempat buat nulis post sekali, pilih akun, pilih waktu, lalu terbit otomatis.
- Satu inbox buat komen dari akun yang terhubung.
- Satu halaman analytics yang jujur (kolom kosong kalau platform nggak ngasih datanya, bukan angka tebakan).
- Gratis dipakai sendiri, self-hosted, biaya infra serendah mungkin.

## 2. Non-goals (sengaja TIDAK dibuat)

- Platform lain (X, LinkedIn, YouTube, Pinterest, Bluesky, dll).
- Multi-workspace, billing, role/permission tim, approval flow.
- Auto-reply DM / automation rules (fase lanjut, lihat P2).
- Konten generator berbasis AI di MVP (opsional P2).
- Mobile app. Web responsive cukup.
- Reverse engineering API privat platform. **Hanya API resmi.**

## 3. User

Satu orang (owner), login sendiri. Skema DB tetap menyimpan `user_id` supaya bisa dikembangkan ke multi-user nanti, tapi MVP tidak membangun fiturnya.

## 4. Scope fitur

### P0: MVP

| # | Fitur | Catatan |
|---|-------|---------|
| 1 | Login owner | Satu akun, session cookie. |
| 2 | Connect akun via OAuth | Threads dulu, lalu Instagram, lalu TikTok. |
| 3 | Composer | Caption + media + pilih akun target + waktu. Preview batas karakter per platform. |
| 4 | Kalender | Tampilan minggu dan bulan, drag untuk ubah jadwal, filter per akun. |
| 5 | Scheduler + publisher | Worker ambil post jatuh tempo, publish per target, catat hasil. |
| 6 | Status per target | `scheduled`, `publishing`, `published`, `failed` + alasan error dari platform. |
| 7 | Retry manual | Tombol retry per target yang gagal. |
| 8 | Refresh token otomatis | Job harian, tandai akun `needs_reconnect` kalau gagal. |

### P1: Setelah MVP jalan

| # | Fitur |
|---|-------|
| 9 | Inbox komen (Threads, Instagram) + balas dari dalam app. |
| 10 | Analytics: per-post dan per-akun (snapshot harian). |
| 11 | Saved replies. |
| 12 | Draft dan antrean (post tanpa jam spesifik). |

### P2: Nice to have

- Auto-reply berbasis keyword (dengan limit per orang dan quiet hours).
- Caption generator LLM dari brief singkat.
- Webhook/notifikasi (Telegram) kalau post gagal.
- Ekspor laporan mingguan.

## 5. Kemampuan per platform

Hasil riset awal. **Wajib diverifikasi ulang ke docs resmi sebelum mulai tiap integrasi.**

| Kemampuan | Threads | Instagram | TikTok |
|-----------|---------|-----------|--------|
| Publish teks | Ya | Tidak (wajib media) | Tidak |
| Publish gambar | Ya | Ya (feed, carousel) | Foto `[VERIFY]` |
| Publish video | Ya | Ya (Reels) | Ya |
| Stories | n/a | Ya `[VERIFY]` | n/a |
| Baca komen | Ya | Ya | Kemungkinan tidak ada API umum `[VERIFY]` |
| Balas komen | Ya | Ya | Kemungkinan tidak ada `[VERIFY]` |
| Analytics | Ya (insights) | Ya (insights) | Terbatas (statistik video/akun) `[VERIFY]` |
| Akun wajib | Threads account | Business/Creator | Akun TikTok biasa |
| Media dari | URL publik | URL publik | Upload chunk atau pull dari domain terverifikasi |

Implikasi desain:

- **Threads & Instagram** mengambil media dari **URL publik**, jadi butuh object storage (Cloudflare R2 atau S3-compatible) dengan URL yang bisa diakses platform.
- Flow publish keduanya dua langkah: buat *container* lalu *publish*. Simpan `creation_id` supaya retry tidak bikin post dobel.
- **TikTok Content Posting API**: aplikasi yang belum lolos audit biasanya hanya bisa posting dengan visibilitas private `[VERIFY]`. Untuk pemakaian pribadi, mode "kirim ke draft/inbox TikTok" mungkin cukup. Putuskan setelah baca docs.
- **App review Meta**: kalau cuma dipakai akun sendiri, mode development dengan role tester biasanya cukup tanpa review `[VERIFY]`. Ini yang bikin self-use jauh lebih gampang.
- Tiap platform punya rate limit harian untuk publish. Worker wajib menghitung dan menolak dengan pesan jelas kalau melebihi.

## 6. Arsitektur

```
Browser (Next.js UI)
   │
Next.js (route handlers / server actions)  ──►  Postgres
   │                                              ▲
   ├──► Object storage (R2/S3) untuk media        │
   │                                              │
Worker (Node, proses terpisah, pg-boss) ──────────┘
   └──► Platform APIs: Threads / Instagram Graph / TikTok
```

- **Stack:** Next.js (App Router) + TypeScript, Postgres, `pg-boss` sebagai job queue di atas Postgres (tanpa Redis), Drizzle ORM, Zod untuk validasi.
- **Kenapa pg-boss:** satu dependency infra lebih sedikit dibanding Redis + BullMQ. Cukup untuk volume pribadi.
- **Deploy:** Docker Compose di VPS kecil (app + worker + Postgres). Worker harus proses long-running, jadi bukan serverless.
- **Waktu:** simpan UTC, tampilkan di timezone user (default `Asia/Jakarta`, bisa diubah).
- **Secret:** token disimpan terenkripsi (AES-256-GCM, key dari env). Tidak pernah di-log.

## 7. Data model (ringkas)

| Tabel | Kolom penting |
|-------|---------------|
| `users` | id, email, password_hash, timezone |
| `social_accounts` | id, user_id, platform, external_id, handle, access_token_enc, refresh_token_enc, expires_at, status (`active` / `needs_reconnect`) |
| `media` | id, storage_key, public_url, mime, size_bytes, width, height, duration_s |
| `posts` | id, user_id, base_caption, scheduled_at, status (`draft` / `scheduled` / `done` / `partial` / `failed`) |
| `post_targets` | id, post_id, account_id, content_type, caption_override, status, attempts, creation_id, external_post_id, error_code, error_message, published_at |
| `post_target_media` | post_target_id, media_id, position |
| `comments` | id, account_id, post_target_id, external_id, author_handle, text, created_at, replied_at, reply_text |
| `metric_snapshots` | id, account_id, post_target_id (nullable), captured_at, metrics (jsonb) |

`metrics` berupa jsonb supaya field yang kosong tetap kosong (bukan 0).

## 8. Alur utama: publish

1. User simpan post dengan `scheduled_at`. Sistem membuat satu job per target dengan `startAfter = scheduled_at`.
2. Worker ambil job, set target `publishing`, validasi rate limit dan token.
3. Panggil API platform (langkah container lalu publish). Simpan `creation_id` sebelum langkah publish.
4. Sukses: simpan `external_post_id`, status `published`. Gagal: simpan `error_code` dan `error_message` dari platform, status `failed`.
5. Retry otomatis hanya untuk error sementara (5xx, timeout, rate limit), maksimal 3 kali dengan backoff. Error permanen (token invalid, media ditolak) langsung `failed`.
6. Status `posts` dihitung dari target: semua sukses = `done`, sebagian = `partial`, tidak ada yang sukses = `failed`.

Idempotency: sebelum membuat container baru, cek `creation_id` yang sudah ada untuk target tersebut.

## 9. UI/UX direction: bukan AI slop

Ini aplikasi kerja harian, bukan landing page. Prinsipnya **kalender adalah pusat**, bukan kartu dan gradien.

**Layout konsep**

```
┌──────┬─────────────────────────────────────┬────────────┐
│Akun  │  Kalender minggu (area utama)       │ Composer / │
│filter│  slot jam × hari, post sebagai blok │ detail post│
│      │                                     │ (drawer)   │
└──────┴─────────────────────────────────────┴────────────┘
```

**Aturan wajib** (detail ada di `AGENTS.md`):

- UI dikerjakan lewat skill `design-taste-frontend` (jalur app screens), **satu screen per run**. Style yang terpilih dikunci di `/docs/design.md` dan dipakai ulang di run berikutnya.
- Hindari default AI: krem + serif + terakota, near-black + hijau neon, grid kartu identik berradius sama dengan shadow abu yang sama, gradient purple, Inter + shadcn tanpa modifikasi, eyebrow ALL-CAPS di atas tiap heading, nomor `01 / 02 / 03` untuk konten yang bukan urutan, fade-slide-up di tiap section.
- Warna status punya makna tetap dan konsisten: terjadwal, terbit, gagal, perlu reconnect. Warna tidak dipakai buat dekorasi.
- Monospace hanya untuk data asli (jam, ID, kode error), bukan label dekoratif.
- Motion hanya sebagai respons aksi user (drag jadwal, buka drawer, konfirmasi simpan).
- Copy: kata kerja aktif, sentence case, nama aksi konsisten ("Jadwalkan" menghasilkan toast "Terjadwal"). Error menjelaskan apa yang salah dan cara memperbaikinya. Empty state mengajak bertindak.
- Kualitas minimum: responsive sampai mobile, fokus keyboard terlihat, `prefers-reduced-motion` dihormati, kontras cukup.

**Skill yang dipakai**

- `design-taste-frontend` dari [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill): art direction, pengecekan di browser nyata, dan pemeriksaan anti-slop. Detail install dan cara pakai ada di `AGENTS.md`.
- Baca `SKILL.md` dan script-nya sebelum instal.

## 10. Non-functional

- **Keamanan:** token terenkripsi, tidak masuk log, `.env` tidak masuk git, OAuth `state` diverifikasi, CSRF aktif, rate limit di endpoint login.
- **Keandalan:** worker aman dijalankan ulang (idempotent), job tidak hilang saat restart.
- **Observability:** log terstruktur per job (target id, platform, hasil), halaman log sederhana di UI.
- **Biaya:** target infra di bawah satu VPS kecil + R2 free tier.

## 11. Milestone

| M | Isi | Selesai kalau |
|---|-----|---------------|
| M0 | Skeleton: Next.js, Postgres, pg-boss, auth, style UI terkunci di `/docs/design.md` | Login jalan, job dummy tereksekusi |
| M1 | **Threads** end-to-end (teks dulu) | Post teks terjadwal terbit di akun asli |
| M2 | Media upload + Threads gambar/video | Post bermedia terbit |
| M3 | **Instagram** (feed, carousel, Reels) | Post terbit lewat container flow |
| M4 | Kalender lengkap (drag, filter) + retry + refresh token | Semua alur P0 lolos |
| M5 | **TikTok** (sesuai batasan audit) | Upload ke draft atau post private berhasil |
| M6 | P1: inbox komen + analytics | Komen terbaca dan analytics tampil |

Urutan sengaja Threads dulu: tidak butuh media storage untuk post teks, jadi cepat membuktikan seluruh pipeline (OAuth, queue, publish, status).

## 12. Open questions

1. Self-use saja atau nanti dibuka untuk orang lain? (Menentukan perlu app review Meta/TikTok atau tidak.)
2. TikTok: cukup "kirim ke draft" atau harus direct post? (Menentukan perlu audit atau tidak.)
3. Hosting: VPS sendiri atau platform lain? (Worker long-running harus punya tempat.)
4. Perlu fitur analytics lintas platform di satu grafik, atau cukup per platform?

## 13. Catatan run UI 1 (2026-11-05)

- Style terkunci: `docs/design.md` (Frost & cobalt, Host Grotesk + JetBrains Mono).
- Layar kalender minggu dibangun sebagai prototipe statis `design/calendar-week.html` (+ `calendar.css`, `calendar.js`, dummy data) **sebelum** scaffold Next.js. M0.1 scaffold Next.js sudah selesai; DB/worker/auth belum.
- Cek UI: skill `design-taste-frontend` 2.5 tidak punya `inspect.mjs --app`; `check.mjs` adalah checker halaman marketing dan crash di layar app. Dipakai `shoot.mjs` 4 lebar, `perf.mjs`, dan audit CDP. Detail di `docs/design.md`.
- Ditunda: drawer detail, aksi `Post baru`/`Sambungkan`/retry (masih dummy), same-slot stacking.
