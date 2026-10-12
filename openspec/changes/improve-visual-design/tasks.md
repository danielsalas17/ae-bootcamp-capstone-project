# Tasks

## 1. Foundations: tokens

- [x] 1.1 Update `frontend/src/index.css` `:root` and `.dark` color tokens to the warm/accent values in [design.md](./design.md) §1; bump `--radius` to `0.75rem`; repurpose `--chart-1` as the rating color
- [x] 1.2 Verify `--primary`/`--primary-foreground` and `--foreground`/`--background` (light and dark) meet WCAG AA contrast with a contrast-checking tool; adjust lightness (not hue) if any pair falls short
- [x] 1.3 Manually spot-check every existing screen (login, home, search, carousel, dialog) with `pnpm dev:frontend` after the token change, before starting component work, to catch any element that assumed black/white primary

## 2. Add required shadcn components

- [x] 2.1 `npx shadcn add switch` and verify `frontend/src/components/ui/switch.tsx` builds
- [x] 2.2 `npx shadcn add textarea` and verify `frontend/src/components/ui/textarea.tsx` builds
- [x] 2.3 `npx shadcn add badge` and verify `frontend/src/components/ui/badge.tsx` builds
- [x] 2.4 `npx shadcn add skeleton` and verify `frontend/src/components/ui/skeleton.tsx` builds; add `motion-reduce:animate-none` to its default className

## 3. App shell

- [x] 3.1 Rework `App.tsx` to render a header (wordmark + `CurrentUserBadge` + search trigger) above a left-aligned, `space-y-12` content column per [design.md](./design.md) §3; verify `App.test.tsx` still passes, updating only assertions tied to removed markup (e.g. centered-text queries)
- [x] 3.2 Move the "Search movies" trigger into the header as an icon+label button (icon-only below `sm`); verify existing `MovieSearch`-opening tests still pass with the new trigger location

## 4. Movie card treatment

- [x] 4.1 Extract the shared card surface/hover/focus classes (per [design.md](./design.md) §4) into one reusable pattern (a small shared component or a `cn()`-composed class constant) used by carousel items, search result rows, and recently-watched rows
- [x] 4.2 Apply the card treatment to `MovieCarousel.tsx`, including the bottom gradient scrim + overlaid title/year; verify `MovieCarousel.test.tsx`
- [x] 4.3 Apply the card treatment (beside-poster layout, no scrim) to `MovieSearch.tsx` result rows; verify `MovieSearch.test.tsx`
- [x] 4.4 Apply the card treatment (beside-poster layout, no scrim) to `RecentlyWatched.tsx` rows; verify `RecentlyWatched.test.tsx`
- [x] 4.5 Add a missing-poster fallback (muted block + `Film` icon) used consistently by carousel, search, recently-watched, and `MovieDetails.tsx`
- [x] 4.6 In `MovieDetails.tsx`, render the rating as a `Badge` using `text-chart-1`/`bg-chart-1` instead of plain text, render genres as individual `Badge variant="secondary"` tags, and line-clamp the overview (`line-clamp-6`); verify `MovieDetails.test.tsx`

## 5. Tracking controls visuals

- [x] 5.1 Replace the native checkbox in `WatchTrackingControls.tsx` with the shadcn `Switch`; update `WatchTrackingControls.test.tsx` queries from the native checkbox role to the switch's accessible role, keeping the same save-on-change assertions
- [x] 5.2 Replace the hand-rolled `<textarea>` with the shadcn `Textarea` in `WatchTrackingControls.tsx`; verify existing save-on-blur/button tests still pass
- [x] 5.3 Update `StarRating.tsx` to use `fill-chart-1 text-chart-1` instead of `fill-yellow-400 text-yellow-400`, and add pointer-hover preview state (cleared on pointer-leave); verify `StarRating.test.tsx`, adding cases for hover-preview show/clear

## 6. Login screen visuals

- [x] 6.1 Wrap `LoginScreen.tsx`'s form in a card surface and apply the display typography scale to its heading per [design.md](./design.md) §6; verify `LoginScreen.test.tsx` still passes (presentation-only change)

## 7. Loading/empty states

- [x] 7.1 Replace the `Loading...`/`Searching...` text states in `MovieCarousel.tsx`, `MovieSearch.tsx`, `RecentlyWatched.tsx`, and `MovieDetails.tsx` with shaped `Skeleton` placeholders per [design.md](./design.md) §7; update the corresponding tests to assert on the skeleton's presence (e.g. `data-slot="skeleton"` or a `role`/`aria-busy` attribute) instead of the removed text
- [x] 7.2 Add a small icon above the existing empty-state copy in `MovieSearch.tsx` ("No movies found.") and `RecentlyWatched.tsx` ("You haven't marked any movies as watched yet.")

## 8. Integration and verification

- [x] 8.1 Run `pnpm --filter frontend test:run` and fix any regressions
- [x] 8.2 Run `pnpm --filter frontend lint` and fix any issues
- [x] 8.3 Manually verify in the browser (`pnpm dev:frontend`) with `prefers-reduced-motion: reduce` emulated (browser devtools) that card hover, skeleton pulse, and dialog open/close all fall back correctly
- [x] 8.4 Run `openspec validate improve-visual-design --strict` and resolve any reported issues
