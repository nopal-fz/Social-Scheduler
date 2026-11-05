# jadwalin

Personal social scheduler untuk Threads, Instagram, dan TikTok. Self-hosted, satu owner.

Status: M0.3 — database, worker, dan auth satu owner. Belum ada kalender atau integrasi platform.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm worker
pnpm worker:ping
```

## Database

Development memakai Postgres 17 dari `docker-compose.yml`. Container dipetakan ke port **5433**
karena port 5432 dipakai Postgres lokal mesin dev.

```bash
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
```

Schema ada di `lib/db/schema.ts`. Setelah mengubah schema, jalankan `pnpm db:generate` lalu
`pnpm db:migrate`; file migration di `drizzle/` ikut di-commit.

## Auth

Buat owner dari nilai di `.env.local`:

```bash
pnpm db:seed
```

`OWNER_EMAIL` dan `OWNER_PASSWORD` hanya dipakai script seed, bukan oleh app. Jalankan seed lagi
untuk mengganti password. `SESSION_SECRET` minimal 32 karakter dan wajib diganti di mesin sendiri.

Login di `/login`. Session disimpan di cookie `httpOnly` selama 7 hari.

## Worker

Worker adalah proses Node terpisah dan memakai pg-boss di Postgres yang sama (tanpa Redis).

```bash
pnpm worker        # terminal terpisah
pnpm worker:ping   # enqueue satu job heartbeat
```

## Structure

```text
app/      Next.js App Router
lib/      kode aplikasi, env, auth, dan database
worker/   proses worker
scripts/  script operasional (seed owner)
drizzle/  migration SQL
docs/     keputusan dan catatan
design/   prototipe statis kalender (referensi visual)
```

## Env

Salin `.env.example` ke `.env.local` untuk development. Jangan commit file `.env*`.
