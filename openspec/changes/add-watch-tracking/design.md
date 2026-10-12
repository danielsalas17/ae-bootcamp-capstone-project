# Design

## Context

See [proposal.md](./proposal.md) for motivation. Relevant current state:

- Backend already has a per-user `WatchEntry` model and `GET/PUT/DELETE /api/users/:userId/entries/:imdbId` routes ([entries.ts](../../../backend/src/routes/entries.ts), [entryService.ts](../../../backend/src/services/entryService.ts)), scoped by `requireUser` middleware. The `imdbId` route param / field name is a leftover from an earlier OMDb-based design; in practice the app now identifies movies by their numeric TMDB id (as used throughout `movies.ts`/`movieSearchService.ts`).
- `rating` on `WatchEntry` has no documented scale or validation today (existing tests use arbitrary values like `9`).
- The frontend has no concept of a current user at all — no login UI, no stored user id, nothing calls `/api/users`.
- There's no modal/dialog UI primitive in `frontend/src/components/ui/` yet, and no star-rating input.
- `MovieSearch.tsx` currently swaps its own content for `MovieDetails.tsx` inline (back/forward), and `MovieCarousel.tsx` items aren't interactive.

## Goals / Non-Goals

**Goals:**
- Minimal, local-only username login that unblocks per-user data without building real auth.
- One shared details dialog, opened the same way from both search results and the carousel.
- Make `rating` a well-defined, validated scale (0-5, 0.5 steps) going forward.

**Non-Goals:**
- Any password/security hardening beyond "trust the client-supplied username exists as a record" (already the documented Auth Model).
- Renaming `imdbId` to a more accurate name across the whole backend (entries, lists, types) — out of scope; this change only documents the mismatch and reuses the field as a generic string movie id.
- Watchlist/favorite UI (fields already exist on `WatchEntry` but aren't touched here).
- Any data migration for existing `rating` values — the local JSON `data/` file has no real data yet.

## Decisions

- **Reuse `imdbId` as the generic movie id param, don't rename it.** Renaming would touch `entries.ts`, `entryService.ts`, `lists.ts`/`listService.ts`, and their tests — a capability (lists) this change doesn't otherwise touch. The frontend will simply pass the movie's TMDB id (stringified) as that param. Revisit the rename separately if/when lists are reworked.
- **Add a shadcn `dialog` component** (`npx shadcn add dialog`) rather than hand-rolling a modal, consistent with the project's "only import what's used" shadcn convention. `MovieDetails` becomes the dialog's content; `MovieSearch` and `MovieCarousel` both render one shared `<MovieDetailsDialog movieId={...} open={...} onOpenChange={...}>` instead of `MovieSearch` owning the panel.
- **Custom star-rating control, no new dependency.** Built from `lucide-react`'s `Star` icon (already a dependency), rendering 5 stars with half-fill support via two stacked icons (or CSS `clip-path`) and pointer-position-based 0.5-step selection. Alternative considered: a third-party rating library — rejected, avoids a new dependency for a simple, fully-custom-styled control.
- **Current user via a small context + `localStorage`.** A `CurrentUserProvider` stores `{ id, username }`, persists the id under one `localStorage` key, and validates it with `GET /api/users/:userId` on load (clearing it on `404`). Alternative considered: prop-drilling the user through `App.tsx` only — rejected, the dialog and future features both need it.
- **Save semantics**: the watched toggle and star rating each `PUT` immediately on change (small, independent, idempotent updates — matches the spec's "independent of rating or review"). The review textarea saves on an explicit "Save review" action (or blur) rather than per-keystroke, to avoid a network call per character.
- **Rating validation lives in `entryService`'s upsert path** (shared helper, e.g. `isValidRating(value): value is null | number`), checked before merging into the stored entry; invalid values short-circuit with a `400` from the route, independent of how/whether the frontend already validates client-side.

## Risks / Trade-offs

- [Removing the inline `MovieDetails` panel changes existing behavior/tests from the in-progress `add-movie-search` change] → Mitigation: this change's tasks update `MovieSearch.test.tsx` / `MovieDetails.test.tsx` to assert dialog behavior instead of inline panel behavior.
- [No passwords means typing someone else's existing username logs in as them] → Mitigation: none beyond documentation; this matches the project's accepted single-local-user, no-social Auth Model, not a security boundary.
- [Custom star-rating control is more code than a library] → Mitigation: keep it small and covered by component tests; revisit if requirements grow beyond 0.5-step display/selection.

## Migration Plan

None required — `backend/data/` has no real entries yet, and this is a local dev-only JSON store. No feature flag needed.
