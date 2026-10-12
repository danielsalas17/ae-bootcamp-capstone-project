# Spec Delta

## Purpose

Lets the current user record personal tracking data for any movie — whether they've watched it, an optional 0-5 star rating, and an optional written review — independent of any other user's data for that same movie.

## ADDED Requirements

### Requirement: Mark a movie as watched

The system SHALL let the current user toggle a "watched" mark for the movie shown in the details dialog, independent of rating or review, and SHALL persist it via the existing per-user watch-entry backend.

#### Scenario: Marking a movie watched

- **WHEN** the current user turns the "watched" toggle on for a movie in the details dialog
- **THEN** the system saves `watched: true` for that user and movie

#### Scenario: Unmarking a movie watched

- **WHEN** the current user turns the "watched" toggle off for a movie previously marked watched
- **THEN** the system saves `watched: false` for that user and movie

### Requirement: Rate a movie from 0 to 5 stars in half-star steps

The system SHALL let the current user optionally set a star rating for the movie shown in the details dialog, in increments of 0.5 stars from 0 to 5 inclusive, and SHALL reject any other value.

#### Scenario: Setting a half-star rating

- **WHEN** the current user picks a rating of `3.5` stars for a movie
- **THEN** the system saves `rating: 3.5` for that user and movie

#### Scenario: Clearing a rating

- **WHEN** the current user clears a previously set rating
- **THEN** the system saves `rating: null` for that user and movie

#### Scenario: Backend rejects an out-of-range or misaligned rating

- **WHEN** a `PUT` request to the watch-entry endpoint includes a `rating` that is not `null` and is outside `0`-`5` or is not a multiple of `0.5`
- **THEN** the system returns `400` with an error message and does not save the entry

### Requirement: Add an optional review

The system SHALL let the current user optionally write and save free-text review notes for the movie shown in the details dialog, independent of the watched mark and rating.

#### Scenario: Saving a review

- **WHEN** the current user writes review text and saves it for a movie
- **THEN** the system persists that text for that user and movie

#### Scenario: Leaving the review blank

- **WHEN** the current user saves the dialog without entering any review text
- **THEN** the system does not require review text and saves the watched mark and/or rating, if any, on their own

### Requirement: Pre-fill existing tracking data when reopening the dialog

The system SHALL load any existing watched mark, rating, and review for the current user and selected movie when the details dialog opens, and SHALL default to unwatched, no rating, and an empty review when none exists.

#### Scenario: Reopening a previously tracked movie

- **WHEN** the current user opens the details dialog for a movie they previously marked watched, rated, or reviewed
- **THEN** the dialog shows their existing watched mark, rating, and review pre-filled

#### Scenario: Opening a never-tracked movie

- **WHEN** the current user opens the details dialog for a movie with no existing entry
- **THEN** the dialog shows the watched toggle off, no rating selected, and an empty review field

### Requirement: Scope tracking data per user

The system SHALL keep each user's watched mark, rating, and review for a given movie independent of every other user's data for that same movie.

#### Scenario: Two users track the same movie independently

- **WHEN** two different users each set their own watched mark, rating, or review for the same movie
- **THEN** each user's data is saved and displayed independently, and neither overwrites the other's
