# Proposal

## Why

The home page already has a "Search movies" button, but clicking it does nothing — there is no search UI and no way to find a movie beyond the popular-movies carousel. Users need a way to look up a specific movie by title so they can view its details and (in a future change) mark it watched, rate it, or add it to a list/watchlist.

## What Changes

- Clicking "Search movies" reveals an inline, stylized search textbox (no modal/page navigation) where the user types a free-text query.
- Add a frontend search results view that lists matching movies (poster, title, year) returned from the backend.
- **BREAKING**: Replace the existing OMDb-backed `GET /api/movies/search` backend endpoint with a TMDB-backed implementation (`GET /movie/search`), since TMDB is the project's source of truth for discovery-style endpoints (see `popular-movies`). The endpoint path and basic query-param contract (`q`) stay the same; the response shape changes to TMDB-derived fields (numeric `id`, `title`, `year`, `posterUrl`).
- **BREAKING**: Replace the existing OMDb-backed `GET /api/movies/:imdbId` details endpoint with a TMDB-backed `GET /api/movies/:tmdbId` endpoint (numeric TMDB id) so a search result can be opened to view full details (overview, director, cast, genre, rating, runtime).
- Add a frontend movie details view, reachable by clicking a search result, that fetches and renders the new details endpoint.
- Query matching is title/keyword text search only (TMDB's `GET /search/movie`, which natively supports matching by title and release year). Matching directly by actor or director name (resolving a person to their filmography) is explicitly out of scope for this change — noted as follow-up work.
- Out of scope: wiring search results into watch entries, ratings, notes, watchlist, favorites, or lists — this change only covers finding a movie and viewing its details.

## Capabilities

### New Capabilities

- `movie-search`: Backend capability for searching movies by title/keyword via TMDB and fetching full movie details by TMDB id; frontend capability for the inline search UI, results list, and a movie details view.

### Modified Capabilities

(none — no capabilities have been synced to `openspec/specs/` yet; the previous `popular-movies` change has not been archived)

## Impact

- **Backend**: `backend/src/routes/movies.ts` — rewrite `/search` to call TMDB and change `/:imdbId` to `/:tmdbId`; `backend/src/services/tmdbService.ts` — add `searchMoviesOnTmdb` and `getMovieDetailsFromTmdb` functions alongside the existing `getPopularMoviesFromTmdb`; add a new `movieSearchService.ts` (or extend `popularMoviesService.ts` naming pattern) to shape TMDB responses into the app's movie DTOs. The existing OMDb-backed `movieService.ts` and `OMDB_API_KEY` become unused by this route (left in place only if still referenced elsewhere; otherwise removed as dead code).
- **Frontend**: `frontend/src/App.tsx` — make the "Search movies" button toggle an inline search box; new `MovieSearch` (or similarly named) component for the textbox + results list; new movie details component/route; `frontend/src/lib/api.ts` — add `searchMovies` and `getMovieDetails` client functions calling the updated backend routes.
- **Data model**: no changes to `backend/data/` or `backend/src/types.ts` — this change does not touch `WatchEntry` or `MovieList`, which remain keyed by `imdbId` for existing (currently unused) entry/list routes. A future change will need to decide how TMDB-id-based search results connect to those `imdbId`-keyed records.
- **No auth/user scoping impact**: search and movie details are not scoped to a user.
