# Spec Delta

## Purpose

Lets a person establish a local-only identity (a username, no password) that scopes all personal movie data to them and persists across page reloads.

## ADDED Requirements

### Requirement: Enter or create a username to log in

The system SHALL show a username entry screen when no valid current user is established, and SHALL create or reuse a user record via the backend when a non-blank username is submitted.

#### Scenario: First-time username creates a user

- **WHEN** a person submits a username that does not yet exist
- **THEN** the system creates a new user via the backend, stores that user's id as the current user, and proceeds to the app

#### Scenario: Existing username logs back in

- **WHEN** a person submits a username that already exists
- **THEN** the system reuses that same user's id as the current user without creating a duplicate, and proceeds to the app

#### Scenario: Blank username is rejected

- **WHEN** a person submits an empty or whitespace-only username
- **THEN** the system shows an inline validation message and does not send a request to the backend

### Requirement: Persist the current user across reloads

The system SHALL remember the current user's id locally (e.g. in `localStorage`) and SHALL skip the login screen on subsequent visits as long as that id still resolves to a valid user.

#### Scenario: Returning visit skips login

- **WHEN** a person reloads or reopens the app and a previously stored user id is still valid
- **THEN** the system skips the username entry screen and goes straight to the app as that user

#### Scenario: Stored user id no longer exists

- **WHEN** a stored user id no longer resolves to a user on the backend
- **THEN** the system clears the stored id and shows the username entry screen again

### Requirement: Switch to a different user

The system SHALL provide a visible control to log out of the current user, clearing the locally stored id and returning to the username entry screen.

#### Scenario: Logging out

- **WHEN** a person uses the "switch user" / "log out" control
- **THEN** the system clears the stored current user id and shows the username entry screen
