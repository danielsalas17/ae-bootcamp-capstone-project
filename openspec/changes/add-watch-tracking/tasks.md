# Tasks

## 1. Backend: rating validation

- [x] 1.1 Add a shared `isValidRating` check (null, or a number in `0`-`5` that is a multiple of `0.5`) used by `entryService`'s upsert path, returning `400` from `PUT /api/users/:userId/entries/:imdbId` on invalid input; verify with new `entryService.test.ts` / `entries` route cases for valid values (`0`, `0.5`, `5`, `null`) and invalid ones (`-1`, `5.5`, `3.25`, `6`)

## 2. Frontend: current user / login

- [x] 2.1 Add `createOrGetUser(username)` and `getUser(userId)` functions and `User` type to `lib/api.ts`; verify with new cases in `api.test.ts`
- [x] 2.2 Add a `CurrentUserProvider`/hook that persists the current user id in `localStorage`, validates it via `getUser` on load, and clears it on a `404`; verify with a dedicated test covering restore, invalid-id clearing, and login/logout
- [x] 2.3 Add a username entry screen (form with validation for blank/whitespace input) shown when there is no current user, calling `createOrGetUser` on submit; verify with a component test covering blank-input rejection and successful submit
- [x] 2.4 Add a visible "switch user" control that logs out (clears the stored id) back to the username entry screen; verify with a component test
- [x] 2.5 Wire `App.tsx` to render the username entry screen until a current user is established, then the existing carousel/search UI; verify `App.test.tsx` covers both states

## 3. Frontend: shared movie details dialog

- [x] 3.1 Add the shadcn `dialog` component (`npx shadcn add dialog`) and verify `frontend/src/components/ui/dialog.tsx` exists and builds
- [x] 3.2 Wrap the existing `MovieDetails` content in a `MovieDetailsDialog` component that takes `movieId`, `open`, and `onOpenChange` props and renders the shadcn `Dialog`; verify with updated `MovieDetails.test.tsx` covering loading, loaded, and error states inside the dialog
- [x] 3.3 Update `MovieSearch.tsx` to open `MovieDetailsDialog` on result selection instead of swapping in the inline panel, keeping the results list visible underneath; verify updated `MovieSearch.test.tsx`
- [x] 3.4 Make `MovieCarousel.tsx` items clickable and open the same `MovieDetailsDialog`; verify with a new/updated `MovieCarousel.test.tsx` case

## 4. Frontend: watch-tracking controls

- [x] 4.1 Add `WatchEntry` type and `getEntry(userId, movieId)` / `upsertEntry(userId, movieId, update)` functions to `lib/api.ts`; verify with new cases in `api.test.ts`
- [x] 4.2 Build a `StarRating` component supporting 0-5 values in 0.5 steps via pointer and keyboard input; verify with a dedicated component test covering half-step selection and display
- [x] 4.3 Add a watched toggle, the `StarRating`, and a review textarea to `MovieDetailsDialog`, pre-filled from the current user's existing entry (or defaulted to unwatched/no rating/empty review) when the dialog opens; verify a component test covers both pre-filled and default states
- [x] 4.4 Save the watched toggle and rating changes immediately via `upsertEntry`; verify a test asserts the correct payload is sent on each change
- [x] 4.5 Save the review text via `upsertEntry` on an explicit save action (e.g. blur or a "Save review" button) rather than per keystroke; verify a test asserts the call happens on that action and not on every keystroke

## 5. Integration and verification

- [x] 5.1 Run `pnpm --filter backend test` and fix any regressions
- [x] 5.2 Run `pnpm --filter frontend test:run` and fix any regressions
- [x] 5.3 Run `openspec validate add-watch-tracking --strict` and resolve any reported issues
