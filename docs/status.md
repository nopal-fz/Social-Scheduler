# Status

Milestone: M0.1 scaffold — selesai.

Done:

- Next.js 16.4.5 App Router, TypeScript strict, ESLint, Vitest.
- Zod env minimal (`lib/env.ts`) + `.env.example`; `.env*` diabaikan.
- Repo git aktif, baseline design/docs ter-push ke `origin/main`.
- Command tersedia: `pnpm dev`, `build`, `start`, `lint`, `typecheck`, `test`.

Next:

- M0.2: Docker Compose Postgres, Drizzle schema minimal, migrasi, worker pg-boss + job dummy.
- Jangan port layar kalender atau auth dulu.

Decisions:

- App pribadi single-owner; auth satu user (M0.3).
- Database development pakai Docker Compose.
- Prototipe `design/` tetap jadi referensi visual; style terkunci di `docs/design.md`.

Files: `app/`, `lib/env.ts`, `.env.example`, `README.md`, `AGENTS.md`, `PRD.md`.

Commands: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm dev`.

Blocked: none.

Jangan simpan token, password, atau isi `.env` di file ini.
