# jadwalin

Personal social scheduler untuk Threads, Instagram, dan TikTok. Self-hosted, satu owner.

Status: M0.1 scaffold. Belum ada database, auth, atau integrasi platform.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

`pnpm worker` dan `pnpm db:migrate` ditambahkan di M0.2.

## Structure

```text
app/      Next.js App Router
lib/      kode aplikasi dan env
worker/   proses worker (M0.2)
docs/     keputusan dan catatan
design/   prototipe statis kalender (referensi visual)
```

## Env

Salin `.env.example` ke `.env.local` untuk development. Jangan commit file `.env*`.
