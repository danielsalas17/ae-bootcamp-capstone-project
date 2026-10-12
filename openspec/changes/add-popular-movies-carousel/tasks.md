# Tasks

## 1. Backend: TMDB client + popular movies service

- [x] 1.1 Add `TMDB_API_KEY` to `backend/.env.example` (documented, no real key committed) and create `backend/src/services/tmdbService.ts` with a `getPopularMoviesFromTmdb()` function calling TMDB's `GET /movie/popular`, and verify the file compiles with `pnpm --filter backend build`
- [x] 1.2 Implement `backend/src/services/popularMoviesService.ts` with `getPopularMovies()` that calls `getPopularMoviesFromTmdb()`, maps results to `{ id, title, year, posterUrl, rating }`, and filters out entries with no poster image
- [x] 1.3 Add an in-memory `{ data, expiresAt }` cache (TTL ~6 hours) around `getPopularMovies()` so repeated calls within the TTL window skip TMDB entirely; propagate an error when TMDB fails and no cached data exists
- [x] 1.4 Write unit tests in `backend/src/services/popularMoviesService.test.ts` covering: cache hit on repeated calls within TTL, cache refresh after TTL expiry, filtering out poster-less entries, and error propagation when TMDB fails with no cache — verify with `pnpm --filter backend test`

## 2. Backend: route

- [x] 2.1 Add `GET /api/movies/popular` to `backend/src/routes/movies.ts` above the existing `GET /:imdbId` route, calling the cached `getPopularMovies()` and returning the array as JSON
- [x] 2.2 Add a route test in `backend/src/routes/movies.test.ts` asserting a 200 response with an array of movies containing `id`, `title`, `year`, `posterUrl`, `rating` — verify with `pnpm --filter backend test`

## 3. Frontend: API client

- [x] 3.1 Create `frontend/src/lib/api.ts` with a `getPopularMovies()` function that calls `GET /api/movies/popular` and returns typed movie data, matching the shape returned by the backend
- [x] 3.2 Write a unit test for `getPopularMovies()` (mocking `fetch`) covering the success path and the error/empty-response path — verify with `pnpm --filter frontend test:run`

## 4. Frontend: carousel component

- [x] 4.1 Install the shadcn carousel component (`npx shadcn@latest add carousel` run from `frontend/`) and verify `frontend/src/components/ui/carousel.tsx` is created and `embla-carousel-react` is added to `frontend/package.json`
- [x] 4.2 Create `frontend/src/components/MovieCarousel.tsx` that calls `getPopularMovies()` on mount, renders each movie's poster/title/year inside the shadcn carousel, and renders nothing (or an empty state) when the fetch fails or returns an empty list
- [x] 4.3 Write component tests in `frontend/src/components/MovieCarousel.test.tsx` covering: renders movie items on successful fetch, and renders gracefully on fetch failure/empty response — verify with `pnpm --filter frontend test:run`

## 5. Frontend: integrate into home page

- [x] 5.1 Render `<MovieCarousel />` in `frontend/src/App.tsx` below the existing hero content
- [x] 5.2 Update `frontend/src/App.test.tsx` as needed so existing tests still pass with the carousel present — verify with `pnpm --filter frontend test:run`

## 6. End-to-end verification

- [x] 6.1 Run the backend and frontend together locally with a real `TMDB_API_KEY` and confirm the home page displays a scrollable carousel of popular movies sourced from the live `/api/movies/popular` endpoint
- [x] 6.2 Run full test suites for both packages (`pnpm --filter backend test`, `pnpm --filter frontend test:run`) and confirm all pass
