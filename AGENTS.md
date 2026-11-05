# AGENTS.md

Instruksi untuk AI coding agent di repo ini. Baca `PRD.md` dulu untuk konteks produk, scope, dan milestone.

## Proyek

Social scheduler pribadi (clone simpel eksis.io): jadwalin post, baca komen, lihat analytics untuk **Threads, Instagram, TikTok**. Self-hosted, satu owner.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Postgres + Drizzle ORM
- `pg-boss` untuk job queue (tanpa Redis)
- Zod untuk validasi semua input eksternal (request, response API platform, env)
- Worker adalah proses Node terpisah (`apps/worker` atau `worker/`), bukan bagian dari request Next.js

## Struktur (target)

```
/app            Next.js routes dan UI
/lib
  /platforms    satu folder per platform: threads/, instagram/, tiktok/
  /queue        definisi job dan handler
  /db           schema Drizzle dan query
  /crypto       enkripsi token
/worker         entrypoint worker
/docs           catatan keputusan dan ringkasan docs platform
```

Setiap platform mengimplementasikan interface yang sama (`connect`, `refreshToken`, `publish`, `fetchComments`, `replyToComment`, `fetchMetrics`). Kemampuan yang tidak didukung dinyatakan eksplisit lewat `capabilities`, bukan dilempar error acak.

## Command

Command yang tersedia:

```
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm worker
pnpm worker:ping
```

## Aturan kerja

1. **Perubahan kecil dan terarah.** Kirim patch/diff untuk bagian yang berubah, jangan regenerasi file utuh kecuali diminta.
2. **Konfirmasi scope dulu** sebelum membuat output besar (banyak file, scaffold penuh, refactor lintas modul). Tulis rencana singkat, tunggu OK.
3. **Satu milestone, satu fokus.** Ikuti urutan M0 sampai M6 di `PRD.md`. Jangan loncat ke TikTok sebelum Threads end-to-end jalan.
4. **Verifikasi docs resmi sebelum integrasi.** Item bertanda `[VERIFY]` di PRD harus dicek ke docs platform terbaru. Tulis ringkasan hasilnya di `/docs/<platform>.md` (scope OAuth, rate limit, batasan, URL docs). Jangan mengandalkan ingatan.
5. **Hanya API resmi.** Dilarang scraping, reverse engineering endpoint privat, atau meniru klien mobile/web platform.
6. **Jangan mengarang** endpoint, field, atau scope. Kalau tidak yakin, tandai `TODO(verify)` dan tanya.
7. **Tanya sebelum menambah dependency** baru yang berat.

## Keamanan

- Token OAuth hanya disimpan terenkripsi (AES-256-GCM, key dari env). **Jangan pernah** di-log, di-commit, atau dikirim ke klien.
- `.env*` masuk `.gitignore`. Sediakan `.env.example` tanpa nilai asli.
- Verifikasi `state` di callback OAuth. CSRF aktif di semua mutation.
- Jangan menaruh secret di fixture test. Pakai nilai palsu.

## Worker dan publish

- Handler job **idempotent**: boleh dijalankan ulang tanpa bikin post dobel. Simpan `creation_id` sebelum langkah publish.
- Retry otomatis hanya untuk error sementara (5xx, timeout, rate limit), maksimal 3 kali dengan backoff. Error permanen langsung `failed` dengan `error_code` dan `error_message` dari platform.
- Hitung rate limit harian per platform sebelum publish. Kalau terlampaui, tolak dengan pesan yang jelas.
- Waktu disimpan UTC. Konversi timezone hanya di lapisan tampilan (default `Asia/Jakarta`).

## UI: anti AI slop

Ini aturan keras untuk semua pekerjaan UI.

**Skill yang dipakai: `design-taste-frontend` (Leonxlnx/taste-skill)**

- Install sekali di mesin dev:
  ```
  npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
  ```
- Butuh Node 22+ dan Chrome/Edge/Chromium terpasang. Cari gambar butuh internet.
- Skill punya alur sendiri: baca brief, pilih arah, bangun, cek di browser pada 3 lebar layar, perbaiki beberapa ronde. **Ikuti alur skill, jangan bikin alur paralel.**
- Proyek ini **app/dashboard, bukan landing page.** Skill terpasang (tasteskill 2.5) tidak punya `inspect.mjs`/`--app`; jalur *app screens* dijalankan manual: satu screen per run, komponen app, tanpa hero/foto/stock. Kalau versi skill yang dipasang nanti punya `inspect.mjs --app`, pakai itu. Jangan pakai foto arsip/stock di UI aplikasi.
- **Satu run = satu screen/view** (kalender, composer drawer, inbox, analytics, pengaturan akun). Jangan minta seluruh app sekaligus: satu build bisa memakan puluhan menit dan ratusan ribu token.
- Setelah style terpilih di run pertama, **kunci** di `/docs/design.md` (palet, tipografi, spacing, aturan komponen). Run berikutnya wajib memakai file itu dan tidak mengundi style baru, supaya antar screen konsisten.
- Baca `SKILL.md` dan script-nya sebelum instal. Skill menjalankan script Node di mesin dev.
- Kalau skill tidak tersedia, tetap ikuti aturan di bawah.

**Daftar tell yang dihindari**

- Krem hangat + serif tinggi kontras + aksen terakota.
- Near-black + satu aksen hijau neon atau vermilion.
- Gradient ungu/biru, gradient wash sebagai dekorasi.
- Konten dipotong jadi kartu identik: radius sama di semua elemen, shadow abu yang sama.
- Inter atau shadcn default tanpa penyesuaian.
- Eyebrow ALL-CAPS di atas tiap heading, label berformat `KATA — fragmen`, string meta dengan titik tengah (`A · B · C`), panah `→` di tiap tombol.
- Aksen satu kata di headline (miring/tebal/beda warna).
- Penomoran `01 / 02 / 03` untuk konten yang bukan urutan.
- Animasi fade-slide-up di tiap section, hover transition di tiap kartu.
- Monospace untuk label dekoratif.

**Arah desain proyek ini**

- Kalender adalah pusat layout. Rail akun di kiri, kalender di tengah, drawer composer/detail di kanan.
- Padat dan fungsional, seperti alat kerja. Bukan marketing page.
- Warna status bermakna tetap dan konsisten: terjadwal, terbit, gagal, perlu reconnect.
- Monospace hanya untuk data asli: jam, ID, kode error.
- Boleh satu elemen yang memorable (misalnya perlakuan blok jadwal di kalender). Sisanya tenang.
- Motion hanya sebagai respons aksi: drag jadwal, buka drawer, konfirmasi simpan.

**Copy**

- Kata kerja aktif, sentence case, tanpa filler.
- Nama aksi sama di seluruh flow: tombol "Jadwalkan" menghasilkan toast "Terjadwal".
- Error menjelaskan apa yang salah dan cara memperbaikinya, tidak minta maaf, tidak samar.
- Empty state mengajak bertindak.

**Kualitas minimum**

- Responsive sampai mobile.
- Fokus keyboard terlihat.
- `prefers-reduced-motion` dihormati.
- Kontras memenuhi WCAG AA.

## Testing

- Unit test untuk logika murni: validasi caption per platform, hitung status post dari target, rate limit, enkripsi token.
- Test adapter platform dengan response yang di-mock dari contoh di docs resmi. **Jangan memanggil API asli di test otomatis.**
- Test handler worker untuk idempotency (jalankan dua kali, hasil sama) dan jalur retry.
- Test manual end-to-end per milestone memakai akun uji milik sendiri.

## Definition of done

- `typecheck`, `lint`, dan `test` lolos.
- Tidak ada secret di diff.
- Kalau menyentuh platform: `/docs/<platform>.md` diperbarui dan item `[VERIFY]` terkait di `PRD.md` diselesaikan.
- Kalau menyentuh UI: screenshot `shoot.mjs` di 1440/1024/768/390 + audit app (console bersih, tidak ada overflow horizontal, kolom header/body sejajar, font termuat, kontras AA, fokus keyboard terlihat) lolos, dan `/docs/design.md` diperbarui jika ada perubahan style. Pakai `inspect.mjs --app` kalau versi skill yang terpasang menyediakannya.
- Perubahan scope atau keputusan penting dicatat di `PRD.md` (bagian status/open questions).

## Hal yang harus ditanyakan dulu

- Menambah platform baru di luar Threads, Instagram, TikTok.
- Mengubah stack (ganti queue, ganti ORM, tambah Redis).
- Fitur di luar scope P0/P1 di `PRD.md`.
- Apa pun yang menyimpan, mengirim, atau menampilkan token pengguna.
- Mengganti style desain yang sudah dikunci di `/docs/design.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
