# Tasks

## 1. Backend: TMDB search and details

- [x] 1.1 Add `searchMoviesOnTmdb(query: string)` to `tmdbService.ts` wrapping TMDB `GET /search/movie`, returning typed `TmdbMovie[]`; verify with a unit/mock test that it builds the correct URL/params and parses the response
- [x] 1.2 Add `getMovieDetailsFromTmdb(tmdbId: string)` to `tmdbService.ts` wrapping TMDB `GET /movie/{id}`, returning a typed details object (or `null`/thrown error on TMDB 404); verify with a unit/mock test covering found and not-found cases
- [x] 1.3 Create `movieSearchService.ts` with `searchMovies(query)` and `getMovieDetails(tmdbId)` that call the new `tmdbService` functions and shape results into app DTOs (`id`, `title`, `year`, `posterUrl` for search; plus `overview`, `genres`, `runtime`, `rating` for details); verify with unit tests covering shaping and the no-poster/missing-field edge cases
- [x] 1.4 Update `routes/movies.ts`: rewrite `GET /search` to call `movieSearchService.searchMovies`, keep the existing 400 behavior for a missing/blank `q`; verify via updated `movies.test.ts` covering success, no-results, missing-query, and TMDB-failure scenarios
- [x] 1.5 Update `routes/movies.ts`: change `GET /:imdbId` to `GET /:tmdbId`, calling `movieSearchService.getMovieDetails`, returning `404` when not found; verify via updated `movies.test.ts` covering found, not-found, and TMDB-failure scenarios
- [x] 1.6 Remove now-unused OMDb search/details wiring for these two routes (`movieService.searchMovies`/`getMovieDetails` usages in `routes/movies.ts`) and confirm `movieService.ts`/`OMDB_API_KEY` are left only where still needed elsewhere (or removed if fully unused); verify `pnpm --filter backend lint` and `pnpm --filter backend test` both pass

## 2. Frontend: API client

- [x] 2.1 Add `searchMovies(query: string)` to `lib/api.ts` calling `GET /api/movies/search?q=...` and returning typed results; verify with a unit test mocking `fetch` for success, empty-results, and non-2xx cases
- [x] 2.2 Add `getMovieDetails(tmdbId: string | number)` to `lib/api.ts` calling `GET /api/movies/:tmdbId` and returning typed details; verify with a unit test mocking `fetch` for success, 404, and non-2xx cases

## 3. Frontend: search UI

- [x] 3.1 Add the shadcn/ui `input` component (`npx shadcn add input` or equivalent) under `components/ui/`; verify the file is generated and the app still builds
- [x] 3.2 Create a `MovieSearch` component with an inline text input (submit-triggered, not per-keystroke), loading state, and error state; verify with a component test (React Testing Library) covering typing + submit, loading, and error rendering
- [x] 3.3 Render search results (poster, title, year) in `MovieSearch` (or a child results component), including an explicit "no movies found" state; verify with a component test covering results-found and no-results rendering
- [x] 3.4 Wire the "Search movies" `Button` in `App.tsx` to toggle the inline `MovieSearch` visibility (open on click, closed by default, closeable); verify with a component test that clicking the button reveals the input and clicking again/closing hides it

## 4. Frontend: movie details view

- [x] 4.1 Create a `MovieDetails` component that fetches and renders a movie's poster, title, year, overview, genres, runtime, and rating, with loading and error states; verify with a component test covering loaded, loading, and error states
- [x] 4.2 Wire selecting a search result to open `MovieDetails` for that movie's TMDB id, and provide a way back to the results list; verify with a component test simulating a result click and the subsequent details render

## 5. Env and docs

- [x] 5.1 Confirm `TMDB_API_KEY` is documented in `backend/.env.example` (added by the prior `popular-movies` change); add it if missing, and verify `backend/.env` still loads correctly in dev
