# Design

## Context

The backend only exposes OMDb-backed search (`GET /api/movies/search`) and detail lookup (`GET /api/movies/:imdbId`) via `movieService.ts` — see [movieService.ts](backend/src/services/movieService.ts). OMDb has no trending/popular endpoint, but [TMDB](https://developer.themoviedb.org/reference/movie-popular-list) exposes a genuine, continuously-updated `GET /movie/popular` endpoint, so this capability's data source is TMDB rather than OMDb. The frontend has no data-fetching or movie-display components yet (only a placeholder `App.tsx` and a single shadcn `button.tsx`), and no shadcn carousel component is installed.

## Goals / Non-Goals

**Goals:**

- Serve a ready-to-render list of genuinely popular movies from one new backend endpoint, cheaply enough to call on every home-page load.
- Keep the OMDb and TMDB integrations independent — this capability does not change the existing `/api/movies/search` or `/api/movies/:imdbId` OMDb routes.
- Never expose the TMDB key to the frontend; all TMDB calls happen server-side, mirroring how `OMDB_API_KEY` is already handled.

**Non-Goals:**

- No merging of TMDB and OMDb data (e.g. no per-movie imdbID lookup) — that would require an extra API call per movie and isn't needed for a display-only carousel.
- No persistence of the popular list or cache to `backend/data/` — it's derived, in-memory, and refetchable from TMDB at any time.
- No per-user personalization of the popular list (consistent with no-social-features scope).

## Decisions

- **New `tmdbService.ts`, not a reuse of `movieService.ts`.** TMDB and OMDb have unrelated request/response shapes and API keys, so `backend/src/services/tmdbService.ts` is a standalone client (own base URL, own `TMDB_API_KEY` env var, own response types), mirroring the structure of the existing `movieService.ts`.
- **`popularMoviesService.ts` owns caching and shaping, not raw TMDB types.** It calls `tmdbService.getPopularMoviesFromTmdb()`, maps each result to a normalized `PopularMovie` shape (`id`, `title`, `year`, `posterUrl`, `rating`), and filters out entries with no poster image (the carousel requires a poster per the spec).
- **In-memory cache with TTL, not a scheduled job.** The service keeps a module-level `{ data, expiresAt }` cache and lazily refreshes it when a request arrives after expiry (TTL ~6 hours). Alternative considered: a `setInterval` background refresh — rejected as unnecessary complexity for an MVP with low request volume.
- **Fail loudly on a cold cache-miss.** If the TMDB request fails and there's no cached data to fall back to, the route propagates the error (500 via the existing global error handler) rather than returning a fabricated or silently-empty 200 — this keeps failures visible instead of masking a misconfigured or down TMDB integration.
- **New route on the existing `moviesRouter`, not a new router.** `GET /api/movies/popular` is added to [movies.ts](backend/src/routes/movies.ts) ahead of the existing `GET /:imdbId` route (so `popular` isn't swallowed as an `:imdbId` path param).
- **shadcn/ui carousel component.** Installed via the shadcn CLI (`npx shadcn@latest add carousel`), which also adds `embla-carousel-react` as a dependency — consistent with the project convention of importing only the shadcn components actually used.
- **Simple fetch-based API client function**, not a new data-fetching library (no React Query in the project today). A `getPopularMovies()` function in a new `frontend/src/lib/api.ts` wraps `fetch('/api/movies/popular')`, matching the lightweight style already used elsewhere in the frontend.

## Risks / Trade-offs

- [TMDB rate limits or outages affect the carousel] → Mitigated by the server-side cache (TTL ~6h), which limits how often TMDB is actually called; on a cold cache-miss the endpoint surfaces a clear error rather than silently degrading.
- [In-memory cache resets on server restart, causing one slow cold-start request] → Acceptable; only affects the first request after a deploy/restart, which still succeeds, just without cache benefit.
- [TMDB posters require an image CDN base URL (`https://image.tmdb.org/t/p/...`) baked into the backend] → Documented in `tmdbService.ts`; if TMDB changes its image CDN convention this needs a code update, same as any third-party API dependency.
