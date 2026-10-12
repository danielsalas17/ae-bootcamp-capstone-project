# Letterboxd Clone (MVP)

A single-user movie tracking app: search movies (via [TMDB](https://www.themoviedb.org/documentation/api)),
view details, mark them watched, rate them, and add personal notes. No social features — every
app is single-user, with no following/sharing/feed.

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for architecture and
conventions, and [openspec/changes/](openspec/changes/) for the proposals that drove each feature.

## Project structure

- `frontend/` — React 19 + TypeScript + Vite, UI built with shadcn/ui (Base UI + Tailwind CSS v4)
- `backend/` — Express + TypeScript REST API, proxies TMDB and persists to a local JSON file (`backend/data/db.json`)

## Current feature status

Implemented, end-to-end (backend + UI):

- Username-only login (no password), current user persisted in `localStorage`
- Movie discovery: a "Popular Movies" carousel on the home screen, and free-text search (`GET /api/movies/search`)
- Movie details in a modal dialog (poster, title, year, genres, runtime, rating, overview), opened from search results or the carousel
- Per-user watch tracking on a movie: a "watched" toggle, an optional 0–5 star rating (0.5 steps), and a free-text review/notes field
- "Recently watched" timeline on the home screen, ordered by `watchedAt` (most recent first)
- A cinema-inspired visual design pass (warm/amber theme, movie-card treatment, skeleton loading states) across all of the above

Modeled on the backend, but with no frontend UI yet:

- `watchlist` and `favorite` boolean flags on each watch entry (`PUT /api/users/:userId/entries/:movieId`)
- User-created movie lists/collections (`/api/users/:userId/lists` — full CRUD, including adding/removing movies)

## Movie data source: TMDB (not OMDb)

The project originally integrated with the [OMDb API](http://www.omdbapi.com/), but all movie
discovery, search, and details endpoints have since been migrated to
[TMDB](https://www.themoviedb.org/documentation/api) (see the
[add-popular-movies-carousel](openspec/changes/add-popular-movies-carousel/proposal.md) and
[add-movie-search](openspec/changes/add-movie-search/proposal.md) change proposals):

- TMDB exposes a genuine "popular movies" endpoint, which OMDb lacks
- TMDB is now the single source of truth for `GET /api/movies/popular`, `GET /api/movies/search`, and `GET /api/movies/:tmdbId`
- Movies are identified by numeric TMDB ids throughout the frontend and the `movies` routes/services. The `WatchEntry`/`MovieList` backend models still name their movie-id field `imdbId` for historical reasons, but the value stored there is the TMDB id — there is no remaining OMDb-backed code path
- Only a `TMDB_API_KEY` is required to run the app; the OMDb-related env var is unused legacy and can be ignored (see below)

## Getting started

```bash
pnpm install
cp backend/.env.example backend/.env   # then set TMDB_API_KEY
pnpm dev:backend                       # starts the API on http://localhost:4000
pnpm dev:frontend                      # starts the UI on http://localhost:5173
```

Get a free TMDB API key (v3 auth) at https://www.themoviedb.org/settings/api. The backend proxies
all TMDB calls — the key never reaches the frontend bundle or client responses.

## Scripts (run from the repo root)

- `pnpm dev:frontend` / `pnpm dev:backend` — start each app in dev mode
- `pnpm build` — build both apps
- `pnpm test` — run frontend (Vitest) and backend (Jest) test suites
- `pnpm lint` — lint both apps
