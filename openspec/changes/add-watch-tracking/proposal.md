# Proposal

## Why

Movie details currently render inline and there is no way to record that you've watched a movie, rate it, or jot a review — the core "tracking" purpose of the app. The backend already models watched/rating/notes per user, but nothing in the frontend writes to it, and there is no way to establish _which_ user you are, since no login UI exists yet.

## What Changes

- Selecting a movie (from search results or the Popular Movies carousel) opens a modal dialog showing full TMDB details (poster, title, year, genres, runtime, rating, overview) instead of the current inline detail panel. **BREAKING**: removes the existing inline `MovieDetails` back/forward flow inside `MovieSearch`.
- The dialog includes an optional "watched" toggle, an optional 0–5 star rating control with 0.5-star steps, and an optional free-text review, all saved per-user against the existing watch-entry backend.
- Adds a minimal username entry screen (no password) so the app has a current user to scope entries to, persisted client-side (localStorage) across reloads, per the project's existing Auth Model.
- Backend: validates `rating` on `PUT /api/users/:userId/entries/:imdbId` is either `null` or a multiple of 0.5 between 0 and 5 (replacing the previously undocumented/unbounded numeric scale).

## Capabilities

### New Capabilities

- `user-login`: minimal username entry/creation flow that establishes the current local user and persists it across reloads; no passwords, no social features.
- `movie-details-dialog`: opens a modal dialog with full TMDB movie details when a movie is selected from search results or the popular movies carousel.
- `watch-tracking`: lets the current user mark a movie watched, set an optional 0–5 (0.5-step) star rating, and add an optional review, scoped per user and persisted via the existing watch-entry backend.

### Modified Capabilities

- (none — `add-movie-search`'s inline details view has not been archived into `openspec/specs/`, so there is no existing main spec to modify; `movie-details-dialog` supersedes that in-progress inline-view behavior directly)

## Impact

- Frontend: `MovieSearch.tsx`, `MovieDetails.tsx`, `MovieCarousel.tsx` reworked to open a shared dialog; new shadcn `dialog` UI component; new star-rating input component; new login screen and a small current-user context/hook backed by `localStorage`; `lib/api.ts` gains user and entry request/response types and calls.
- Backend: `entryService.ts` / `routes/entries.ts` gain rating validation (0–5 in 0.5 steps, or `null`); no data migration needed (local JSON dev data only).
- No changes to OMDb/TMDB key handling or social-feature scope.
