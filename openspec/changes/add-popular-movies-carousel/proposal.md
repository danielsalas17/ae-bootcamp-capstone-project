# Proposal

## Why

The app currently has no way to discover movies — the landing page is a static placeholder with a single "Search movies" button and no actual search implemented yet. Surfacing a "Popular Movies" carousel gives users something to browse immediately on arrival. OMDb (used elsewhere in this app for search/details) has no trending/popular endpoint, but [TMDB](https://www.themoviedb.org/documentation/api) does expose a genuine, continuously updated `GET /movie/popular` endpoint, so this capability uses TMDB as the data source instead of a hand-curated list.

## What Changes

- Add a new backend endpoint, `GET /api/movies/popular`, that returns currently popular movies (id, title, year, poster URL, rating) resolved from TMDB's live `GET /movie/popular` endpoint.
- Add a `TMDB_API_KEY` backend env var (loaded via `dotenv`, alongside the existing `OMDB_API_KEY`) used only server-side to call TMDB.
- Cache the resolved popular-movies response server-side (in-memory, process-scoped) and refresh it periodically (every few hours) instead of calling TMDB on every request.
- Add a `MovieCarousel` component to the frontend home page that fetches from the new endpoint and displays the returned movies as a horizontally scrollable carousel (poster, title, year).
- Add a frontend API client function for calling the new endpoint.

## Capabilities

### New Capabilities

- `popular-movies`: Backend capability for fetching, caching, and serving a list of currently popular movies resolved via TMDB; frontend capability for fetching and displaying that list as a home-page carousel.

### Modified Capabilities

(none — no existing specs in this project yet)

## Impact

- **Backend**: new route in `backend/src/routes/movies.ts`, a new `tmdbService.ts` for the TMDB HTTP call (mirroring the existing `movieService.ts` OMDb client), and a `popularMoviesService.ts` for caching + shaping the response. No changes to `backend/data/` (cache is in-memory, not persisted). New `TMDB_API_KEY` env var, documented in `.env.example`, never exposed to the frontend.
- **Frontend**: new `MovieCarousel` component under `frontend/src/components/`, a shadcn/ui carousel component import, a new API client module for calling `/api/movies/popular`, and an update to `frontend/src/App.tsx` to render the carousel on the home page.
- **Dependencies**: adds the shadcn/ui carousel component (backed by `embla-carousel-react`) to the frontend.
- **No auth/user scoping impact**: popular movies are global, read-only content, not scoped to a user.
