# Design

## Context

See [proposal.md](proposal.md) for motivation. Relevant current state:

- `WatchEntry` (backend `types.ts` / frontend `lib/api.ts`) has `watched`, `rating`, `notes`, `watchlist`, `favorite`, `createdAt`, `updatedAt` but no dedicated "when watched" field; `updatedAt` changes on any field edit, so it can't be used for a stable watch-history ordering.
- `entryService.upsertEntry` merges partial updates into an existing entry or creates one, always bumping `updatedAt`.
- `GET /api/users/:userId/entries` returns the user's raw `WatchEntry[]` (no embedded movie metadata); movie metadata comes from a separate `GET /api/movies/:tmdbId` call, keyed by the entry's `imdbId` field (which, despite the name, currently stores the TMDB id — see `backend/data/db.json`).
- `App.tsx` renders `MovieCarousel` and opens `MovieDetailsDialog` by `movieId` (TMDB id); this is the existing pattern for movie selection.
- `add-watch-tracking` (in-flight, not archived) owns the base watch-entry creation/rating/notes flow this change builds on.

## Goals / Non-Goals

**Goals:**

- Add a `watchedAt` timestamp to `WatchEntry` that only moves on a `false -> true` transition of `watched`.
- Render a "Recently watched" timeline on the main screen, newest first, reusing the existing movie-details-dialog selection pattern.

**Non-Goals:**

- No pagination/virtualization of the timeline (MVP data sizes are small, local JSON file).
- No new bulk/enrichment backend endpoint — the frontend enriches entries with movie details via existing per-movie calls.
- No backfill migration script for existing `data/db.json` entries; missing `watchedAt` is handled as a fallback-sort case per the spec.

## Decisions

### `watchedAt` is computed in `upsertEntry`, not a new service function

`entryService.upsertEntry` already knows both the existing entry's `watched` value and the incoming update. Before merging, if `update.watched === true` and the existing entry's `watched` is not already `true` (including entry creation with `watched: true`), set `watchedAt` to `now`. Otherwise leave `watchedAt` untouched (don't let it be overwritten by an update payload that doesn't change `watched`). This keeps the rule in one place instead of duplicating it in the route handler.

Alternative considered: let the route/frontend pass `watchedAt` explicitly. Rejected — it would require the client to compute/trust a timestamp, duplicating logic and opening a spot for clock skew or spoofed values; deriving it server-side from the `watched` transition is simpler and matches how `updatedAt` is already handled.

### Frontend enriches entries with movie details client-side, per entry

The timeline needs poster/title/year per watched movie, which only `GET /api/movies/:tmdbId` provides. Given the MVP's small local dataset, the `RecentlyWatched` component fetches the user's entries, filters to `watched`, and issues one `getMovieDetails` call per watched entry in parallel (`Promise.all`), then sorts the combined results by `watchedAt` (falling back to `updatedAt` when `watchedAt` is missing) descending.

Alternative considered: add a backend endpoint that joins entries with cached movie metadata server-side. Rejected for now — more surface area than the MVP needs; the existing per-movie endpoint is already proxied/cached via TMDB service, and entry counts are expected to be small.

### Timeline UI: vertical list with a connecting line, not a new carousel

Reuse the existing card/poster visual language from `MovieCarousel` for each entry, laid out vertically with a left-side connector line and a date label per item, rather than introducing a new horizontal carousel (the "timeline" framing calls for a vertical chronological read, not another scroller). Clicking an item opens the existing `MovieDetailsDialog` by `movieId`, matching how the carousel and search results already open it.

### Legacy entries without `watchedAt`

Entries written before this change have `watchedAt: undefined`/`null` but may already be `watched: true` (see current `data/db.json`). Per the spec, these are still shown, sorted after all entries that do have a `watchedAt`, using `updatedAt` as the fallback key, so no watched movie silently disappears from the timeline after this change ships.

## Risks / Trade-offs

- [N+1 movie-detail fetches for the timeline] → Acceptable for MVP data volumes; the movie-details endpoint is already called this way elsewhere (carousel items, search results) and the local JSON store / TMDB proxy can handle it. Revisit with a batch endpoint only if real usage shows it's slow.
- [Mixed ordering for legacy entries missing `watchedAt`] → Documented fallback (`updatedAt`) in the spec keeps behavior deterministic and visible instead of silently dropping older entries.
