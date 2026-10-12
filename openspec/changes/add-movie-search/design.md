# Design

## Context

The frontend home page (`App.tsx`) has a static "Search movies" `Button` with no handler. The backend already integrates with two external movie APIs:
- `movieService.ts` — OMDb-backed, used by the current `GET /api/movies/search` (title-only) and `GET /api/movies/:imdbId` (details) routes.
- `tmdbService.ts` — TMDB-backed, currently only used by `popularMoviesService.ts` for `GET /api/movies/popular`.

`WatchEntry` and `MovieList` (in `backend/src/types.ts`) are keyed by `imdbId` (OMDb string ids like `tt0111161`). This change does not touch those routes or that data model — see proposal.md "Impact" for why that's deferred.

## Goals / Non-Goals

**Goals:**
- Make "Search movies" functional end-to-end: button → inline input → results list → details view.
- Route all search/details data through TMDB, consistent with `popular-movies`, instead of maintaining two different external movie APIs for similar purposes.

**Non-Goals:**
- Actor/director-aware search (resolving a person name to their filmography). TMDB's `/search/movie` only matches on title/keyword + optional year; combining that with cast/crew requires a separate `/search/person` + `/discover/movie` chain, deferred to a follow-up change.
- Connecting search results to watch entries, ratings, notes, watchlist, favorites, or lists.
- Removing `OMDB_API_KEY` or `movieService.ts` outright — left in place since entries/lists routes may still reference OMDb-style ids conceptually; only the `/search` and `/:imdbId`→`/:tmdbId` routes are rewired in this change.

## Decisions

- **Reuse `tmdbService.ts` as the single TMDB HTTP client.** Add `searchMoviesOnTmdb(query)` (wraps `GET /search/movie`) and `getMovieDetailsFromTmdb(tmdbId)` (wraps `GET /movie/{id}`), following the existing `getPopularMoviesFromTmdb` pattern (same base URL, same `getApiKey()` helper, same `fetch` + status check). Alternative considered: a separate TMDB client per use case — rejected, since the base URL, API key, and error handling are identical and splitting them would just duplicate code.
- **New `movieSearchService.ts` shapes TMDB responses into app DTOs**, mirroring `popularMoviesService.ts`'s role (translate `TmdbMovie` → `PopularMovie`). This keeps route handlers thin per project convention and keeps TMDB's raw shape out of the route layer. No caching here (unlike `popularMoviesService`), since search results and details are per-query/per-id, not a single shared cacheable resource.
- **Change `/:imdbId` to `/:tmdbId`** (numeric) rather than keeping the old path and adding a new one, since this app has no real users/data yet and running two parallel movie-detail routes would be confusing with no migration benefit. Documented as **BREAKING** in the proposal.
- **No new frontend routing library.** The search box and details view are rendered conditionally within `App.tsx`/new components using local component state (e.g., `activeView: 'home' | 'results' | 'details'` or similar), not a route change — keeps this change additive to the existing single-page structure rather than introducing React Router for one feature.
- **Debouncing/triggering**: search fires on form submit (Enter key / explicit submit), not on every keystroke, to avoid hammering the backend/TMDB on every character. Simpler than debounced live-search and sufficient for an MVP.

## Risks / Trade-offs

- [Removing OMDb-backed `/search` and `/:imdbId` routes breaks any existing client code relying on `imdbId`-shaped responses] → No other part of this codebase currently consumes those routes from the frontend (only `MovieCarousel` + popular movies exist today), so blast radius is limited to the two route handlers and their tests.
- [TMDB rate limits / API key quota] → Same risk profile as the existing `popular-movies` capability already accepted; no additional mitigation beyond what TMDB already provides.
- [Numeric TMDB ids vs. string `imdbId` used by `WatchEntry`/`MovieList`] → Explicitly deferred (see Non-Goals); a future change must decide how a TMDB search result becomes an `imdbId`-keyed watch entry (e.g., storing TMDB id directly, or resolving `imdb_id` via TMDB's `external_ids`).

## Migration Plan

- Additive on the frontend (new UI, no routing changes needed outside `App.tsx`).
- Backend route change is a direct swap: implement TMDB-backed logic in `tmdbService.ts`/new `movieSearchService.ts`, then update `movies.ts` route handlers to call it, removing the OMDb calls from those two handlers. No data migration needed (no persisted search/details data).
- No rollback-specific tooling needed beyond standard git revert, since no stored data changes shape.
