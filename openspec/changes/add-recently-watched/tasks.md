# Tasks

## 1. Backend: `watchedAt` on watch entries

- [x] 1.1 Add `watchedAt: string | null` to the `WatchEntry` interface in `backend/src/types.ts` and verify the project builds (`pnpm --filter backend build` or `tsc --noEmit`) with no type errors
- [x] 1.2 Update `upsertEntry` in `backend/src/services/entryService.ts` to set `watchedAt` to the current ISO timestamp only when `update.watched === true` and the existing entry's `watched` is not already `true` (including creation with `watched: true`); leave `watchedAt` unchanged on every other update, and default new entries to `watchedAt: null`
- [x] 1.3 Add/extend tests in `backend/src/services/entryService.test.ts` covering: first watch sets `watchedAt`, editing notes/rating on an already-watched entry leaves `watchedAt` unchanged, and unmarking then re-marking watched refreshes `watchedAt`; verify with `pnpm --filter backend test`
- [x] 1.4 Confirm `GET /api/users/:userId/entries` and `PUT /api/users/:userId/entries/:imdbId` responses include `watchedAt` by extending the relevant request tests in `backend/src/app.test.ts`, and verify with `pnpm --filter backend test`

## 2. Frontend: API client support

- [x] 2.1 Add `watchedAt: string | null` to the `WatchEntry` interface in `frontend/src/lib/api.ts` and add a `listEntriesForUser(userId: string): Promise<WatchEntry[]>` function that calls `GET /api/users/:userId/entries`
- [x] 2.2 Add tests in `frontend/src/lib/api.test.ts` for `listEntriesForUser` (request URL, response parsing, non-OK response throws) and verify with `pnpm --filter frontend test`

## 3. Frontend: `RecentlyWatched` component

- [x] 3.1 Create `frontend/src/components/RecentlyWatched.tsx` that, for the current user, fetches entries via `listEntriesForUser`, filters to `watched === true`, fetches movie details per entry in parallel via `getMovieDetails`, and sorts the combined results by `watchedAt` descending (falling back to `updatedAt` when `watchedAt` is `null`)
- [x] 3.2 Render the sorted entries as a vertical timeline (poster, title, year, rating if set, formatted watched date, connecting line between items), and an empty-state message when there are no watched entries
- [x] 3.3 Make each timeline item selectable, opening `MovieDetailsDialog` for that movie's `movieId`, matching the existing selection pattern used by `MovieCarousel`
- [x] 3.4 Add `frontend/src/components/RecentlyWatched.test.tsx` covering: newest-first ordering, empty state, legacy entries without `watchedAt` sorted after entries that have one, and selecting an item triggers the details dialog open callback; verify with `pnpm --filter frontend test`

## 4. Wire into the app

- [x] 4.1 Render `RecentlyWatched` in `frontend/src/App.tsx` for the logged-in view, passing the current user's id, and verify `pnpm --filter frontend test` passes for `App.test.tsx`
- [x] 4.2 Manually verify end-to-end with `pnpm dev:backend` and `pnpm dev:frontend`: mark a movie watched, confirm it appears at the top of "Recently watched", mark a second movie watched, confirm ordering, then unmark one and confirm it disappears from the list
