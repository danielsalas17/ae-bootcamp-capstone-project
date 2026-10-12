# Spec Delta

## Purpose

Defines the home screen's structural layout — a header plus a left-aligned, consistently spaced content column — replacing the current single centered block in `App.tsx`.

## ADDED Requirements

### Requirement: Header bar with wordmark and current-user controls

The system SHALL render a persistent header containing the app wordmark and the current user's badge/switch-user control, separate from the scrollable content below it.

#### Scenario: Header is visible once logged in

- **WHEN** a logged-in user views the home screen
- **THEN** a header is rendered containing the app wordmark and the current user's badge

#### Scenario: Search is reachable from the header

- **WHEN** a logged-in user views the home screen
- **THEN** a control to open movie search is present in the header

### Requirement: Left-aligned content sections with consistent spacing

The system SHALL lay out the home screen's content (intro/search, Popular Movies, Recently Watched) as left-aligned sections within a consistent max-width column, with uniform vertical spacing between sections.

#### Scenario: Section headings are left-aligned

- **WHEN** the home screen renders the "Popular Movies" or "Recently watched" section
- **THEN** the section heading and its content are left-aligned, not centered

#### Scenario: Sections share consistent spacing

- **WHEN** the home screen renders multiple sections
- **THEN** the vertical gap between any two adjacent sections is the same
