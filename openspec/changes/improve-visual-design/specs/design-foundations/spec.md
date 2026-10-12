# Spec Delta

## Purpose

Defines the color, typography, spacing, radius, and motion tokens that back every other visual requirement in this change, and the contrast/reduced-motion guarantees those tokens must uphold regardless of which component consumes them.

## ADDED Requirements

### Requirement: Warm accent-driven color tokens

The system SHALL define a single real-chroma accent color (used for primary actions, focus rings, and ratings) and warm (non-zero-chroma) neutral tokens for background/foreground/card/muted/border, for both the light (`:root`) and dark (`.dark`) themes, via the existing CSS variable names already consumed by shadcn UI primitives.

#### Scenario: Primary actions use the accent color

- **WHEN** a `Button` with the `default` variant is rendered anywhere in the app
- **THEN** its background renders using the `--primary` token's accent color, not a zero-chroma gray/black

#### Scenario: Focus rings use the accent color

- **WHEN** any focusable control (button, input, switch, link) receives keyboard focus
- **THEN** its visible focus ring renders using the `--ring` token's accent color

#### Scenario: Dark theme stays in sync

- **WHEN** the `dark` class is applied to the document root
- **THEN** `--background`, `--foreground`, `--card`, `--primary`, and `--ring` all resolve to the warm dark-theme values defined alongside the light theme (no leftover zero-chroma dark values)

### Requirement: Text contrast meets WCAG AA

The system SHALL ensure every new or changed foreground/background token pairing used for text meets WCAG AA contrast (4.5:1 for body text, 3:1 for large text/UI components).

#### Scenario: Primary button text is readable

- **WHEN** `--primary-foreground` text is rendered on a `--primary` background
- **THEN** the contrast ratio between them is at least 4.5:1

#### Scenario: Body text is readable

- **WHEN** `--foreground` text is rendered on `--background`
- **THEN** the contrast ratio between them is at least 4.5:1

### Requirement: Dedicated rating color distinct from primary actions

The system SHALL expose a color token for star ratings that is visually distinct from the primary action color, so a filled star never reads as a button.

#### Scenario: Rating color differs from primary

- **WHEN** a filled star (in `StarRating` or a rating badge) and a primary button are both visible
- **THEN** they render in different hues (rating uses the `--chart-1` token; primary actions use `--primary`)

### Requirement: Reduced-motion fallback for every new animation

The system SHALL provide a non-animated or reduced fallback, honoring `prefers-reduced-motion: reduce`, for every hover transition, skeleton pulse, and dialog open/close animation introduced by this change.

#### Scenario: Reduced motion disables hover translation

- **WHEN** a user with `prefers-reduced-motion: reduce` hovers a movie card
- **THEN** no translate/transform animation plays, while the hover's shadow/ring feedback still applies

#### Scenario: Reduced motion disables skeleton pulsing

- **WHEN** a user with `prefers-reduced-motion: reduce` views a loading skeleton
- **THEN** the skeleton renders as a static placeholder with no pulse animation
