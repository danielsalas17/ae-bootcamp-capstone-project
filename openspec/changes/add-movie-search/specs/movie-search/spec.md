# Spec Delta

## Purpose

Lets a user find a specific movie by typing a title/keyword search and view that movie's full details, using TMDB as the data source.

## ADDED Requirements

### Requirement: Search movies by title

The system SHALL provide a `GET /api/movies/search` endpoint that accepts a required `q` query parameter and returns a list of movies matching that title/keyword query, resolved via TMDB's movie search. Each result SHALL include at minimum: a TMDB `id`, `title`, `year`, and `posterUrl` (omitted or null when TMDB has no poster).

#### Scenario: Successful search with matches

- **WHEN** a client requests `GET /api/movies/search?q=inception`
- **THEN** the system returns `200` with a JSON array of movies matching "inception", each with `id`, `title`, `year`, and `posterUrl`

#### Scenario: Search with no matches

- **WHEN** a client requests `GET /api/movies/search?q=<query with no TMDB matches>`
- **THEN** the system returns `200` with an empty JSON array

#### Scenario: Missing query parameter

- **WHEN** a client requests `GET /api/movies/search` without a `q` parameter, or with a blank/whitespace-only `q`
- **THEN** the system returns `400` with an error message indicating `q` is required

#### Scenario: Upstream TMDB failure

- **WHEN** TMDB's search endpoint is unreachable or returns an error while handling a search request
- **THEN** the system returns a `5xx` error response instead of a partial or malformed result

### Requirement: View movie details by TMDB id

The system SHALL provide a `GET /api/movies/:tmdbId` endpoint that returns full details for a single movie identified by its numeric TMDB id, resolved via TMDB's movie details endpoint. Details SHALL include at minimum: `id`, `title`, `year`, `posterUrl`, `overview`, `genres`, `runtime`, and `rating`.

#### Scenario: Movie exists

- **WHEN** a client requests `GET /api/movies/27205` for a valid TMDB movie id
- **THEN** the system returns `200` with the movie's details

#### Scenario: Movie does not exist

- **WHEN** a client requests `GET /api/movies/:tmdbId` for an id TMDB does not recognize
- **THEN** the system returns `404` with an error message indicating the movie was not found

### Requirement: Reveal inline movie search

The system SHALL reveal a stylized text input in place when the user clicks the "Search movies" button on the home page, without navigating to a new page or opening a modal dialog.

#### Scenario: Opening the search box

- **WHEN** the user clicks "Search movies"
- **THEN** an inline text input for entering a search query appears on the page, and the input receives focus

#### Scenario: Closing the search box

- **WHEN** the user dismisses the open search input (e.g., clicking the button again or an explicit close control)
- **THEN** the input and any results are hidden

### Requirement: Display search results

The system SHALL query the backend search endpoint as the user submits a query and display the returned movies as a results list, showing each movie's poster, title, and year.

#### Scenario: Results found

- **WHEN** the user submits a non-empty search query that returns one or more matches
- **THEN** the system displays a list of result items, each showing poster, title, and year

#### Scenario: No results found

- **WHEN** the user submits a non-empty search query that returns zero matches
- **THEN** the system displays a message indicating no movies were found

#### Scenario: Search request fails

- **WHEN** the backend search request fails (network error or non-2xx response)
- **THEN** the system displays an error message instead of a results list or a blank screen

### Requirement: View movie details from a search result

The system SHALL let the user open a movie details view by selecting a result from the search results list, fetching from the backend details endpoint and displaying the movie's poster, title, year, overview, genres, runtime, and rating.

#### Scenario: Opening details from a result

- **WHEN** the user selects a movie from the search results list
- **THEN** the system fetches that movie's details from the backend and displays them

#### Scenario: Details request fails

- **WHEN** the backend details request fails (network error, `404`, or other non-2xx response)
- **THEN** the system displays an error message instead of a blank or partial details view
