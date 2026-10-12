# Letterboxd Clone (MVP)

A single-user movie tracking app: search movies via OMDb, mark them watched, rate them, add
notes, maintain a watchlist, favorite movies, and organize them into lists. No social features.

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for architecture and
conventions.

## Project structure

- `frontend/` — React + TypeScript + Vite, UI built with shadcn/ui (Base UI + Tailwind CSS)
- `backend/` — Express + TypeScript REST API, proxies OMDb and persists to a local JSON file

## Getting started

```bash
pnpm install
cp backend/.env.example backend/.env   # then set OMDB_API_KEY
pnpm dev:backend                       # starts the API on http://localhost:4000
pnpm dev:frontend                      # starts the UI on http://localhost:5173
```

Get a free OMDb API key at http://www.omdbapi.com/apikey.aspx.

## Scripts (run from the repo root)

- `pnpm dev:frontend` / `pnpm dev:backend` — start each app in dev mode
- `pnpm build` — build both apps
- `pnpm test` — run frontend (Vitest) and backend (Jest) test suites
- `pnpm lint` — lint both apps
