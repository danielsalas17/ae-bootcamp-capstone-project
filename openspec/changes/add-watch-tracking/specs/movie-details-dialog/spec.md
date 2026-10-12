# Spec Delta

## Purpose

Shows a movie's full TMDB details in a modal dialog whenever a movie is selected anywhere in the app, instead of navigating to or revealing an inline details panel.

## ADDED Requirements

### Requirement: Open details dialog from search results
The system SHALL open a modal dialog showing the selected movie's full TMDB details when a user selects a movie from the search results list, fetching from the existing movie details endpoint.

#### Scenario: Selecting a search result opens the dialog

- **WHEN** a user selects a movie from the search results list
- **THEN** a modal dialog opens showing a loading state, then the movie's poster, title, year, genres, runtime, TMDB rating, and overview
- **AND** the search results list remains underneath, unchanged, once the dialog is closed

#### Scenario: Details request fails

- **WHEN** the backend movie details request fails (network error, `404`, or other non-2xx response) while the dialog is open
- **THEN** the dialog shows an error message instead of a blank or partial details view

### Requirement: Open details dialog from the popular movies carousel
The system SHALL open the same modal dialog, showing that movie's full TMDB details, when a user selects a poster in the Popular Movies carousel.

#### Scenario: Selecting a carousel poster opens the dialog

- **WHEN** a user selects a movie poster in the Popular Movies carousel
- **THEN** a modal dialog opens showing that movie's full TMDB details

### Requirement: Close the details dialog
The system SHALL let the user dismiss the open details dialog via an explicit close control, clicking outside the dialog, or pressing Escape, returning focus to the underlying view without navigating away from it.

#### Scenario: Dismissing the dialog

- **WHEN** a user closes the dialog (close control, outside click, or Escape)
- **THEN** the dialog closes and the search results or carousel remain visible exactly as before the dialog opened
