# Design

## Context

See [proposal.md](./proposal.md) for the specific gaps this addresses. Verified by: running `pnpm dev:backend` (http://localhost:4000) and `pnpm dev:frontend` (http://localhost:5173) successfully, and reading every component listed in the proposal's Impact section plus their tests, `frontend/src/index.css`, `frontend/components.json` (style `base-nova`, neutral base, CSS variables on, no prefix), and `frontend/src/components/ui/{button,input,dialog,carousel}.tsx` to see how existing primitives already consume theme tokens (`bg-primary`, `ring-ring/50`, `rounded-lg` → `--radius-lg`, etc.).

Key existing facts that shape the decisions below:

- Every shadcn primitive already reads from the CSS variables in `:root`/`.dark` (`buttonVariants`, `Input`, `DialogContent`) — changing token _values_ restyles the whole app without touching those files.
- `Button`'s `default` variant is `bg-primary text-primary-foreground`; `ghost`/`outline` use `hover:bg-muted`. These roles must keep working once `--primary`/`--muted` carry real chroma.
- `DialogContent` already animates via `data-open:animate-in data-open:zoom-in-95` with `duration-100` — this change only adjusts the duration, not the mechanism.
- `--chart-1` through `--chart-5` are defined in `index.css` and exposed as Tailwind colors (`@theme inline` maps `--color-chart-1: var(--chart-1)`, etc.) but are **unused anywhere in the app** (no charts exist). This change repurposes `--chart-1` as the dedicated "rating gold" token (`text-chart-1` / `fill-chart-1`) instead of inventing a new CSS variable.
- No component today applies the `dark` class; `.dark` tokens are updated for consistency but there's no toggle to build or test here.

## Goals / Non-Goals

**Goals:**

- Establish warm, intentional color/typography/spacing/motion tokens that read as "movie app," not "default shadcn gray."
- Make every movie entry point (carousel, search, recently-watched, dialog) share one consistent, tactile card treatment.
- Bring the hand-rolled checkbox/textarea/star-color up to the same visual quality as the rest of the shadcn-based UI.
- Replace text-only loading states with skeleton placeholders.
- Respect `prefers-reduced-motion` everywhere a new transition/animation is introduced.

**Non-Goals:**

- No new pages, routes, or features. No social features.
- No backend changes, no new API shapes.
- No dark-mode toggle UI (token values updated, switch mechanism not built).
- No change to `watch-tracking`, `user-login`, `movie-details-dialog`, `movie-search`, `popular-movies`, or `recently-watched` _behavior_ as specified in prior changes — only presentation.
- No new fonts or icon libraries — stays on `Geist Variable` and `lucide-react`, both already dependencies.

## Decisions

### 1. Color tokens (`frontend/src/index.css`)

Keep every existing CSS variable name (zero risk to existing `bg-*`/`text-*` usages); change values from zero-chroma gray to a warm palette with one real accent hue (~55-70° in OKLCH, an amber/marigold "marquee gold") reserved for primary actions, focus rings, and ratings.

| Token                                     | Current (`:root`)               | New (`:root`)           | Why                                                                                                                                              |
| ----------------------------------------- | ------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--background`                            | `oklch(1 0 0)`                  | `oklch(0.98 0.006 80)`  | Warm off-white instead of clinical pure white                                                                                                    |
| `--foreground`                            | `oklch(0.145 0 0)`              | `oklch(0.17 0.014 55)`  | Warm near-black ink                                                                                                                              |
| `--card` / `--popover`                    | `oklch(1 0 0)`                  | `oklch(1 0.003 80)`     | Slightly lighter than `--background` so card surfaces lift without relying on shadow alone                                                       |
| `--primary`                               | `oklch(0.205 0 0)` (near-black) | `oklch(0.72 0.15 55)`   | Marigold becomes the one confident accent, used for primary buttons, active states                                                               |
| `--primary-foreground`                    | `oklch(0.985 0 0)`              | `oklch(0.18 0.03 55)`   | Dark ink text on the lighter amber reads higher-contrast than white-on-amber                                                                     |
| `--secondary`                             | `oklch(0.97 0 0)`               | `oklch(0.95 0.008 70)`  | Warm light neutral                                                                                                                               |
| `--muted`                                 | `oklch(0.97 0 0)`               | `oklch(0.955 0.007 70)` | Warm light neutral, distinct enough from `--secondary` via usage, not hue                                                                        |
| `--muted-foreground`                      | `oklch(0.556 0 0)`              | `oklch(0.5 0.014 55)`   | Warm mid-gray                                                                                                                                    |
| `--accent`                                | `oklch(0.97 0 0)` (== muted)    | `oklch(0.93 0.035 60)`  | Visible warm wash for hover/selected backgrounds, now distinct from `--muted`                                                                    |
| `--accent-foreground`                     | `oklch(0.205 0 0)`              | `oklch(0.22 0.03 55)`   | Ink that reads on the warm wash                                                                                                                  |
| `--border` / `--input`                    | `oklch(0.922 0 0)`              | `oklch(0.89 0.012 70)`  | Warm light border                                                                                                                                |
| `--ring`                                  | `oklch(0.708 0 0)`              | `oklch(0.72 0.13 55)`   | Focus ring matches the brand accent instead of generic gray                                                                                      |
| `--chart-1` (repurposed as "rating gold") | `oklch(0.87 0 0)`               | `oklch(0.78 0.16 70)`   | Dedicated star-rating fill color, warmer/more golden than `--primary` so ratings read distinctly from buttons                                    |
| `--destructive`                           | `oklch(0.577 0.245 27.325)`     | unchanged               | Already has real chroma; out of scope                                                                                                            |
| `--radius`                                | `0.625rem`                      | `0.75rem`               | Slightly softer corners; cascades to every `rounded-{sm,md,lg,xl,...}` usage already wired through `@theme inline` with zero per-component edits |

`.dark` gets the analogous warm-shifted treatment (e.g. `--background: oklch(0.17 0.014 55)`, `--card: oklch(0.22 0.016 55)` lighter than background for the same lift effect, `--primary`/`--chart-1` kept close to the light values since amber reads well on dark backgrounds too). Exact `.dark` values are implemented alongside `:root` in the same task so they never drift out of sync.

**Contrast is verified during implementation, not guessed here**: before marking the token task done, check `--primary`-on-`--primary-foreground` and `--foreground`-on-`--background` (and the `.dark` equivalents) against WCAG AA (4.5:1 for body text, 3:1 for large text/UI) with a contrast tool, nudging lightness only (never hue) if a pair falls short.

### 2. Typography scale

No new font — `Geist Variable` stays. Establish explicit scale usage (Tailwind utilities, applied where each element currently has an ad hoc size):

| Role         | Classes                                                               | Used for                                                                                                              |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Display      | `text-4xl md:text-5xl font-semibold tracking-tight`                   | App wordmark in the header and the login screen's welcome heading                                                     |
| Title        | `text-xl md:text-2xl font-semibold tracking-tight`                    | Section headings ("Popular Movies", "Recently watched"), movie title in the details dialog                            |
| Card title   | `text-sm font-medium leading-snug` with 2-line clamp (`line-clamp-2`) | Movie title on carousel items, search results, recently-watched rows                                                  |
| Body         | `text-sm leading-relaxed`                                             | Overview text, review textarea content                                                                                |
| Caption/meta | `text-xs uppercase tracking-wide text-muted-foreground`               | Year, genre list, watched date — gives small metadata a bit of editorial character instead of blending into body text |

### 3. Spacing & layout (`app-shell`)

- `App.tsx` changes from one centered `flex flex-col items-center justify-center text-center` block to: a `header` (sticky, `border-b`, `bg-background/80 backdrop-blur-sm`) containing the wordmark (left) and `CurrentUserBadge` (right), then a `main` content column, `max-w-4xl mx-auto`, **left-aligned**, with `space-y-12` (was `gap-4`) between sections (intro/search, Popular Movies, Recently Watched) and `px-4 py-8 md:px-8` outer padding.
- Each section keeps its own heading + content, but the heading moves from `text-center` to left-aligned, matching how a content/list-heavy app (vs. a marketing page) is normally scanned.
- The search trigger moves into the header as an icon+label button next to the wordmark on desktop, collapsing to an icon-only button (`size="icon"`, `aria-label="Search movies"`) below `sm`.

### 4. `movie-card` — shared treatment for carousel/search/recently-watched/dialog poster

- Surface: `bg-card rounded-xl ring-1 ring-border/60 shadow-sm overflow-hidden` wrapping the poster + metadata (currently: bare `<img>` + text, no wrapper at all).
- Hover/focus feedback (carousel items, search rows, recently-watched rows — all currently `<button>`s with no hover treatment besides the search row's flat `hover:bg-muted`):
  `motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` — `motion-reduce` users get the shadow/ring feedback with no translate.
- Poster: `aspect-2/3 w-full object-cover`, with a **bottom gradient scrim** (`bg-gradient-to-t from-black/70 via-black/10 to-transparent`) on carousel items specifically, so title/year can overlay the poster image directly (white text) rather than sitting below it — a denser, more "browsable" card for a horizontally-scrolling rail. Search-result rows and the recently-watched timeline keep text beside (not over) the poster since those are already single-column list layouts where overlay text would add no density benefit.
- Missing poster fallback: a `bg-muted` block with a centered `Film` icon (`lucide-react`, already a dependency) at `text-muted-foreground`, same aspect ratio — replacing the current plain empty `<div className="h-48 w-32 shrink-0 rounded-md bg-muted" />` / conditional non-render.
- Rating badge: when `MovieDetails` has a TMDB `rating`, render it as a small circular `Badge` (new shadcn component) in the card/dialog corner (`bg-chart-1/90 text-background font-semibold`) instead of the current plain `Rating: 7.5` text line.
- Genre tags in the dialog: each genre as a `Badge variant="secondary"` pill instead of a comma-joined string, wrapping (`flex flex-wrap gap-1.5`).
- Overview text: `line-clamp-6` with `leading-relaxed` so a long synopsis doesn't blow out dialog height; full text is still in the DOM (no "read more" interaction added — kept simple, avoids new state/behavior).

### 5. `tracking-controls-visuals`

- "Watched" toggle: replace `<input type="checkbox">` with shadcn `Switch` (`npx shadcn add switch`), labeled via the existing `<label>` wrapper pattern already used elsewhere (`Watched` text stays).
- Review field: replace the hand-rolled `<textarea className="min-h-20 w-full rounded-md border p-2 text-sm">` with shadcn `Textarea` (`npx shadcn add textarea`) so it shares `Input`'s border/focus-ring/disabled styling.
- `StarRating.tsx`: replace hardcoded `fill-yellow-400 text-yellow-400` with `fill-chart-1 text-chart-1` (ties the fill color to the new theme token from Decision 1); add a hover-preview — on `pointer-enter` of a half-star hit target, show the same fill treatment at reduced opacity (`opacity-70`) up to the hovered value, cleared on `pointer-leave`, with `motion-safe:transition-opacity motion-safe:duration-150`. Click behavior (half-step selection, clear-on-reselect) is unchanged.
- Save affordance: the existing "Save review" `Button` keeps its current enabled/disabled/label logic; only its container spacing changes to match the new card/section rhythm (`gap-3` → consistent with surrounding dialog spacing).

### 6. `login-screen-visuals`

- Wrap the form in a `bg-card rounded-xl ring-1 ring-border/60 shadow-sm p-6` surface instead of bare floating text, so the first screen a user sees has the same card language as the rest of the app.
- Welcome heading uses the Display scale from Decision 2 (`text-4xl font-semibold tracking-tight`) instead of `text-2xl`.
- Page background gets a very subtle radial warm wash behind the card (`bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)]`, low opacity) — the one place a soft gradient texture is used, since there's no competing poster art on this screen (per the "don't compete with movie art" principle).

### 7. Loading / empty / error states

- Replace `<p>Loading...</p>` / `<p>Searching...</p>` text with shadcn `Skeleton` (`npx shadcn add skeleton`) placeholders shaped like the real content:
  - `MovieCarousel`: 4 skeleton cards (`aspect-2/3` poster + two text-line skeletons) while `getPopularMovies` is pending.
  - `MovieSearch`: 3 skeleton rows (thumbnail + two text-line skeletons) while a search is in flight.
  - `RecentlyWatched`: 2 skeleton timeline rows while entries/movie details are loading.
  - `MovieDetails` (inside the dialog): a skeleton poster + skeleton text block while `getMovieDetails` is pending.
  - Respect `prefers-reduced-motion`: shadcn's default `Skeleton` uses `animate-pulse`; add `motion-reduce:animate-none` so reduced-motion users get a static placeholder instead of a pulsing one.
- Empty states (`No movies found.`, `You haven't marked any movies as watched yet.`) keep their copy but gain a small centered `lucide-react` icon (`SearchX`, `Clapperboard`) above the text at `text-muted-foreground`, inside generous padding (`py-12`), so an empty section doesn't read as "broken."
- Error states keep their current copy/`role="alert"` and `text-destructive` color (already a real-chroma token, untouched) — no behavior change, just confirming they remain visually consistent once the rest of the palette changes.

### 8. Motion summary (with reduced-motion fallback for each)

| Interaction        | Motion                                                                          | Reduced-motion fallback                                                                       |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Movie card hover   | translate-y + shadow, 200ms ease-out                                            | shadow/ring only, no translate                                                                |
| Star hover preview | opacity fade, 150ms ease-out                                                    | same (opacity change isn't a "motion" concern, kept as-is)                                    |
| Dialog open/close  | existing `animate-in/out zoom-in-95 fade-in-0`, duration bumped `100ms → 150ms` | `motion-reduce:data-open:animate-none` fade only, no zoom                                     |
| Skeleton loading   | `animate-pulse`                                                                 | `motion-reduce:animate-none` (static placeholder)                                             |
| Switch toggle      | shadcn `Switch` default thumb-slide transition                                  | unaffected (small, functional state-change motion is kept per shadcn default; not decorative) |

## Risks / Trade-offs

- [Changing shared CSS variable values is global — any component relying on an implicit "primary is black/white" assumption could look wrong] → Mitigation: re-run the full frontend test suite and manually re-check every screen listed in Impact after the token change, before touching individual components.
- [Repurposing `--chart-1` for "rating gold" instead of a new variable is a slight abuse of intent] → Mitigation: it's genuinely unused today (no charts exist), named generically enough (`chart-1`, not `chart-revenue`) to be safely repurposed, and avoids growing the token set; revisit if real chart UI is ever added.
- [Adding a gradient scrim + overlaid text to carousel cards only (not search/recently-watched) is an inconsistency across the three list types] → Mitigation: intentional — carousel items are a dense horizontal rail (overlay maximizes poster size), while search/recently-watched are vertical lists with room for beside-poster text; documented here so it isn't read as an oversight.
- [Four new shadcn components (`switch`, `textarea`, `badge`, `skeleton`) add surface area] → Mitigation: each replaces an existing hand-rolled/unstyled equivalent or fills a documented gap (no skeleton/badge exists today) — net consistency gain, not scope creep.

## Migration Plan

None required — purely presentational changes to existing components and CSS variable values; no data shape, API, or route changes. Existing tests are updated only where they assert on markup this change intentionally replaces (e.g. a test querying `role="checkbox"` moves to querying the `Switch`'s accessible role, which shadcn/base-ui's `Switch` also exposes as `checkbox`-compatible via ARIA `switch` role — update the query, not the behavior).
