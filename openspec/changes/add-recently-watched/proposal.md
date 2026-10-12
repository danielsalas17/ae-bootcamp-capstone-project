# Proposal

## Why

Marking a movie as watched is currently a dead end — there's no place in the app to look back at what you've watched or when. Users need a quick, chronological view of their watch history to feel like the app is actually tracking their activity.

## What Changes

- Adds a "Recently watched" section to the main app screen that lists the current user's watched movies in a timeline (latest first), showing each movie's poster, title, year, the user's rating (if set), and when it was watched.
- Backend: adds a `watchedAt` timestamp to each watch entry, set the first time an entry transitions to `watched: true` and refreshed whenever it's marked watched again after being unmarked. This decouples "when watched" from `updatedAt` (which also changes when a user only edits notes/rating on an already-watched entry), so the timeline order doesn't shift from unrelated edits. The existing `add-watch-tracking` change (not yet archived) owns the base `WatchEntry` shape, so this field is introduced as a requirement of the new `recently-watched` capability below rather than a delta against a not-yet-existing `watch-tracking` main spec.
- Backend: `GET /api/users/:userId/entries` continues to return raw entries; the new `watchedAt` field is just an added property on the existing `WatchEntry` shape (no new endpoint, no breaking response shape change).
- Frontend: fetches the current user's entries, filters to `watched: true`, sorts by `watchedAt` descending, and renders a scrollable timeline, each item linking back to the movie details dialog.

## Capabilities

### New Capabilities

- `recently-watched`: displays the current user's watched movies in a latest-to-oldest timeline on the main screen; includes the backend `watchedAt` timestamp that entries need in order to be ordered this way.

### Modified Capabilities

- (none — `watch-tracking` has no main spec under `openspec/specs/` yet since `add-watch-tracking` hasn't been archived, so there is nothing to delta; the `watchedAt` field is specified as part of the new `recently-watched` capability instead)

## Impact

- Backend: `types.ts` (`WatchEntry.watchedAt`), `entryService.ts` (`upsertEntry` sets/refreshes `watchedAt` on the `watched: false -> true` transition), `data/db.json` entries gain the new field (existing entries treated as `watchedAt: null` until next update).
- Frontend: new `RecentlyWatched` component rendered on the main screen in `App.tsx`; `lib/api.ts` gains `watchedAt` on the `WatchEntry` type and a helper to list+enrich watched entries with movie details (via the existing per-movie details endpoint).
- No new backend endpoints; no changes to auth model or social-feature scope.
