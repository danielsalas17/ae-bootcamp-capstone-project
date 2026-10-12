# Proposal

## Why

With both dev servers running and the current frontend source/tests read end-to-end, the app today is functionally complete (login, search, popular carousel, recently watched, watch-tracking dialog) but visually unfinished:

- `frontend/src/index.css` defines every neutral color (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--ring`, `--primary`, etc.) as pure zero-chroma gray (`oklch(x 0 0)`) in both `:root` and `.dark`. There is no brand/accent color anywhere — `--accent` is literally identical to `--muted`. The app reads as an unstyled grayscale wireframe, not a movie app.
- `App.tsx` wraps the entire page — title, intro copy, search trigger, the Popular Movies carousel, and the Recently Watched timeline — in one `flex flex-col items-center justify-center text-center` column with no header/app-shell. Content lists and carousels end up center-aligned, which reads fine for a hero/marketing block but is awkward for scannable lists.
- Movie "cards" are bare `<img>` + text with no surface, shadow, or hover feedback: `MovieCarousel.tsx`, `MovieSearch.tsx` (`hover:bg-muted` on the row only), and `RecentlyWatched.tsx` give no visual sense these are interactive beyond a cursor change.
- `WatchTrackingControls.tsx` uses a raw unstyled `<input type="checkbox">` and a hand-rolled `<textarea className="... border p-2 ...">` that don't match the shadcn `Input`/`Button` styling used two lines away in the same file.
- `StarRating.tsx` hardcodes `fill-yellow-400 text-yellow-400` — a color with no relationship to any theme token, so it can't be retheme'd and doesn't match anything else in the UI. It also has no hover-preview before clicking.
- Every async view (`MovieCarousel`, `MovieSearch`, `RecentlyWatched`, `MovieDetails`, `WatchTrackingControls`) shows loading/empty/error states as a single line of plain text — no skeletons, no illustrated empty states.
- `LoginScreen.tsx`, the very first thing any user sees, is plain centered text and an unstyled form with no brand moment.
- The `.dark` theme block exists but nothing in the app ever applies the `dark` class — it's currently dead code that should stay in sync with the light theme rework even though a toggle UI is out of scope here.

## What Changes

- Rework the color/typography/spacing/motion tokens in `frontend/src/index.css` to a warm, cinema-inspired palette (warm neutrals + a single amber/marigold accent used for primary actions, focus rings, and ratings) instead of flat zero-chroma gray, for both `:root` and `.dark`. **Non-breaking**: same CSS variable names, only their values change, so every existing component that already consumes `bg-primary`, `text-muted-foreground`, etc. picks up the new look with no code change.
- Introduce a real app shell in `App.tsx`: a header bar (wordmark + `CurrentUserBadge`) above a left-aligned content column with consistent section spacing, replacing the single centered `text-center` block.
- Give movie entries (carousel items, search results, recently-watched rows, the details dialog poster) a consistent "movie card" treatment: card surface, shadow, hover lift/scale, a genre/rating badge, and a title/meta layout that handles missing posters, long titles, and missing ratings.
- Replace the native checkbox and hand-rolled textarea in `WatchTrackingControls.tsx` with shadcn `switch` and `textarea` components; restyle `StarRating.tsx` to use a theme token (not hardcoded `yellow-400`) and add a hover preview.
- Replace plain-text loading states with shadcn `skeleton` placeholders in the carousel, search results, recently-watched list, and movie details dialog.
- Give `LoginScreen.tsx` a brand moment (wordmark/display treatment, card surface around the form) consistent with the new design language.
- Add `prefers-reduced-motion` fallbacks for every new hover/transition/skeleton animation.

## Capabilities

### New Capabilities

- `design-foundations`: the color, typography, spacing, radius, and motion tokens that back every other visual requirement in this change.
- `app-shell`: the header/content layout structure and section spacing on the home screen.
- `movie-card`: the shared visual treatment (surface, hover, badges, fallback states) for a movie's poster+metadata wherever it appears (carousel, search results, recently-watched, dialog).
- `tracking-controls-visuals`: the visual/interaction polish of the watched-switch, star rating, and review textarea (presentation only — does not change the save/validation behavior already specified by `add-watch-tracking`'s `watch-tracking` capability).
- `login-screen-visuals`: the visual treatment of the username entry screen (presentation only — does not change the `user-login` capability's behavior).

### Modified Capabilities

- (none — no capability from prior changes has been archived to `openspec/specs/` yet; this change only adds visual/presentation requirements layered on top of the already-implemented `add-movie-search`, `add-popular-movies-carousel`, `add-recently-watched`, and `add-watch-tracking` behavior, which it does not alter)

## Impact

- Frontend tokens: `frontend/src/index.css` (color/typography/radius/motion token values only).
- Frontend components reworked for visuals (no behavior change): `App.tsx`, `MovieCarousel.tsx`, `MovieSearch.tsx`, `RecentlyWatched.tsx`, `MovieDetails.tsx`, `MovieDetailsDialog.tsx`, `WatchTrackingControls.tsx`, `StarRating.tsx`, `LoginScreen.tsx`, `CurrentUserBadge.tsx`.
- New shadcn/ui components to add via CLI: `switch`, `textarea`, `badge`, `skeleton` (none of these exist under `frontend/src/components/ui/` today).
- Corresponding test files (`*.test.tsx`) updated only where current assertions depend on markup this change changes (e.g. querying the native checkbox role, or a specific loading-text string) — no new behavior to test, existing scenarios must keep passing.
- No backend impact. No new routes, data, or OMDb/TMDB usage. No social features. No dark-mode toggle UI added (token values for `.dark` are kept in sync for future use only).
