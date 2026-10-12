# Spec Delta

## Purpose

Gives the current user a latest-to-oldest timeline view of the movies they've marked as watched, so their watch history is visible at a glance on the main screen.

## ADDED Requirements

### Requirement: Watched timestamp on watch entries

The system SHALL record a `watchedAt` timestamp on a watch entry, set the first time the entry's `watched` field transitions from `false` (or unset) to `true`, and refreshed to the current time each subsequent time `watched` transitions from `false` to `true` again. The timestamp SHALL NOT change when any other field (`rating`, `notes`, `watchlist`, `favorite`) is updated on an already-watched entry, and SHALL be left as `null` while `watched` is `false`.

#### Scenario: Marking a movie watched sets the timestamp

- **WHEN** a user marks a movie as watched for the first time
- **THEN** the entry's `watchedAt` is set to the current time

#### Scenario: Editing rating or notes does not change the timestamp

- **WHEN** a user updates the rating or notes on an entry that is already `watched: true`
- **THEN** the entry's `watchedAt` is unchanged

#### Scenario: Re-marking as watched refreshes the timestamp

- **WHEN** a user unmarks a movie as watched and later marks it watched again
- **THEN** the entry's `watchedAt` is updated to the time of the new "watched" transition

### Requirement: Recently watched timeline

The system SHALL display a "Recently watched" section on the main screen listing the current user's watched movies (`watched: true`) ordered from most recently watched to least recently watched, using each entry's `watchedAt` timestamp. Each timeline item SHALL show the movie's poster, title, year, and the user's rating if one is set. Entries without a `watchedAt` value (data predating this capability) SHALL still appear, ordered after all entries that have one, using `updatedAt` as a fallback ordering key.

#### Scenario: Multiple watched movies render newest first

- **WHEN** the current user has watched three movies at different times
- **THEN** the timeline lists them with the most recently watched movie first and the earliest watched movie last

#### Scenario: No watched movies yet

- **WHEN** the current user has no entries with `watched: true`
- **THEN** the "Recently watched" section shows an empty-state message instead of a list

#### Scenario: Unwatching a movie removes it from the timeline

- **WHEN** a user unmarks a previously watched movie (`watched` set back to `false`)
- **THEN** that movie no longer appears in the "Recently watched" timeline

#### Scenario: Selecting a timeline item opens movie details

- **WHEN** the user selects a movie in the "Recently watched" timeline
- **THEN** the movie details dialog opens for that movie
