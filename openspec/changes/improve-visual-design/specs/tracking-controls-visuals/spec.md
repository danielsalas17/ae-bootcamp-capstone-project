# Spec Delta

## Purpose

Defines the visual/interaction presentation of the watch-tracking controls (watched switch, star rating, review textarea) — purely presentational; does not change any save/validation behavior already specified by the `add-watch-tracking` change's `watch-tracking` capability.

## ADDED Requirements

### Requirement: Watched control uses a themed switch

The system SHALL present the "watched" control as a themed toggle switch rather than an unstyled native checkbox, while preserving its existing on/off save behavior.

#### Scenario: Watched control is a switch

- **WHEN** the details dialog renders the watched control
- **THEN** it is rendered as a themed switch component, not a bare native checkbox

### Requirement: Star rating uses the theme's rating color

The system SHALL render filled stars in the star rating control using the dedicated rating color token rather than a hardcoded color unrelated to the theme.

#### Scenario: Filled stars use the rating token

- **WHEN** the star rating control renders a filled star
- **THEN** its fill color comes from the theme's rating color token

### Requirement: Star rating previews a value on hover

The system SHALL show a preview fill (distinct from the committed/selected fill) when a pointer hovers over the star rating control, before any click commits a value.

#### Scenario: Hovering previews a rating

- **WHEN** a pointer hovers over a star position without clicking
- **THEN** the stars up to that position show a preview fill distinguishable from a committed selection

#### Scenario: Moving the pointer away clears the preview

- **WHEN** the pointer leaves the star rating control without clicking
- **THEN** the preview fill clears and the control shows only the previously committed rating (if any)

### Requirement: Review field uses the themed textarea

The system SHALL present the review text field as a themed textarea component matching the visual style (border, focus ring) of other themed form fields in the app.

#### Scenario: Review field matches themed form styling

- **WHEN** the details dialog renders the review field
- **THEN** it shares the same border and focus-ring styling as other themed form inputs in the app
