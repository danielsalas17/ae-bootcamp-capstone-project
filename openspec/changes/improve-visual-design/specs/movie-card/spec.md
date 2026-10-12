# Spec Delta

## Purpose

Defines one consistent visual treatment for a movie's poster + metadata wherever it appears — the Popular Movies carousel, search results, the Recently Watched timeline, and the details dialog — including hover/focus feedback and fallback states for missing data.

## ADDED Requirements

### Requirement: Movie entries render as a surfaced, elevated card

The system SHALL render every movie entry (carousel item, search result row, recently-watched row, dialog poster) with a visible card surface (background, rounded corners, subtle border or shadow) rather than a bare image with no container.

#### Scenario: Carousel item has a card surface

- **WHEN** the Popular Movies carousel renders a movie
- **THEN** the poster and its metadata are contained within a visible card surface (rounded corners, background, border or shadow)

### Requirement: Interactive movie entries give hover and focus feedback

The system SHALL visibly respond to hover and keyboard focus on every clickable movie entry, with a focus-visible outline distinct from the hover state.

#### Scenario: Hovering a movie card shows feedback

- **WHEN** a pointer hovers over a clickable movie card
- **THEN** the card's visual state changes (e.g. elevation/shadow) to indicate it is interactive

#### Scenario: Keyboard focus is visible

- **WHEN** a movie card receives keyboard focus
- **THEN** a visible focus ring is rendered around it, distinguishable from the hover state

### Requirement: Missing poster fallback

The system SHALL render a placeholder graphic in place of a movie poster whenever a poster URL is unavailable, matching the surrounding card's aspect ratio and surface.

#### Scenario: Movie has no poster

- **WHEN** a movie entry with no poster URL is rendered in the carousel, search results, recently-watched list, or dialog
- **THEN** a placeholder graphic is shown in the poster's position instead of a broken image or blank space

### Requirement: Rating displayed as a visually distinct badge

The system SHALL display a movie's rating (when available) as a visually distinct badge rather than plain inline text, using the dedicated rating color token.

#### Scenario: Movie details dialog shows a rating badge

- **WHEN** the details dialog renders a movie with a known rating
- **THEN** the rating is shown in a badge using the rating color token, not as a plain-text sentence

### Requirement: Genres displayed as individual tags

The system SHALL display a movie's genres as individual wrapping tags rather than a single comma-joined string.

#### Scenario: Movie details dialog shows genre tags

- **WHEN** the details dialog renders a movie with one or more genres
- **THEN** each genre renders as its own tag, and tags wrap to a new line when they don't fit on one

### Requirement: Long overview text is visually bounded

The system SHALL visually bound a movie's overview/synopsis text so it does not cause unbounded dialog growth, while keeping the full text present in the document.

#### Scenario: Overview exceeds the clamp

- **WHEN** a movie's overview text is long enough to exceed the configured line clamp
- **THEN** the rendered text is visually truncated with an ellipsis while remaining present in the DOM
