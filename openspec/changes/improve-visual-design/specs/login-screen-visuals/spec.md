# Spec Delta

## Purpose

Defines the visual treatment of the username entry (login) screen — purely presentational; does not change any behavior already specified by the `add-watch-tracking` change's `user-login` capability.

## ADDED Requirements

### Requirement: Login form renders within a card surface

The system SHALL render the username entry form within a visible card surface (background, rounded corners, border or shadow) rather than as bare floating text, while preserving its existing validation and submit behavior.

#### Scenario: Login form has a card surface

- **WHEN** the login screen is shown to a user with no current session
- **THEN** the username form is contained within a visible card surface

### Requirement: Login screen uses the display typography scale

The system SHALL render the login screen's welcome heading using the app's display typography scale, distinguishing it from section-level headings elsewhere in the app.

#### Scenario: Welcome heading uses display scale

- **WHEN** the login screen renders its welcome heading
- **THEN** the heading uses the display typography scale defined by `design-foundations`
