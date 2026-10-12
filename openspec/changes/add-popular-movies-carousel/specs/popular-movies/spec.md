# Spec Delta

## Purpose

Lets users discover movies to watch by browsing a list of currently popular titles on the home page, without requiring a search query.

## ADDED Requirements

### Requirement: Popular movies endpoint

The backend SHALL expose `GET /api/movies/popular`, which returns a list of currently popular movies sourced from TMDB's popular-movies endpoint, with at least: `id`, `title`, `year`, `posterUrl`, and `rating`. This endpoint SHALL NOT require a user identity or scope results to a user.

#### Scenario: Fetching the popular movies list

- **WHEN** a client sends `GET /api/movies/popular`
- **THEN** the response is a 200 with a JSON array of movie objects, each containing `id`, `title`, `year`, `posterUrl`, and `rating`

#### Scenario: A TMDB result has no poster

- **WHEN** TMDB returns a popular movie with no poster image available
- **THEN** that entry is omitted from the response and the remaining entries are still returned with a 200

#### Scenario: TMDB request fails and no cached data is available

- **WHEN** the backend's request to TMDB fails (network error or non-success response) and there is no previously cached result
- **THEN** the endpoint responds with an error status instead of a fabricated or empty success response

### Requirement: Server-side caching of popular movies

The backend SHALL cache the resolved popular-movies response in memory and SHALL NOT call TMDB for every incoming request. The cache SHALL be refreshed periodically (on the order of hours) rather than on every request.

#### Scenario: Repeated requests within the cache window

- **WHEN** two requests to `GET /api/movies/popular` arrive within the cache's refresh window
- **THEN** the second request is served from the cached result without issuing a new TMDB request

#### Scenario: Cache expires and is refreshed

- **WHEN** a request arrives after the cache's refresh window has elapsed
- **THEN** the backend re-fetches the popular list from TMDB and serves the refreshed result, replacing the stale cache entry

### Requirement: Popular movies carousel on the home page

The frontend home page SHALL display a horizontally scrollable carousel of popular movies, each showing at least the poster image, title, and year, sourced from `GET /api/movies/popular`.

#### Scenario: Carousel renders on page load

- **WHEN** a user loads the home page
- **THEN** the frontend requests `GET /api/movies/popular` and renders the returned movies as carousel items

#### Scenario: Popular movies endpoint returns no data

- **WHEN** the `GET /api/movies/popular` request fails or returns an empty list
- **THEN** the home page renders without the carousel (or with an empty/error state) instead of breaking the rest of the page
