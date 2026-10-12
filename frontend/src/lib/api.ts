export interface PopularMovie {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  rating: number;
}

export interface MovieSearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
}

export interface MovieDetails {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
  overview: string;
  genres: string[];
  runtime: number | null;
  rating: number;
}

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface WatchEntry {
  id: string;
  userId: string;
  imdbId: string;
  watched: boolean;
  watchedAt: string | null;
  rating: number | null;
  notes: string;
  watchlist: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WatchEntryUpdate = Partial<
  Pick<WatchEntry, 'watched' | 'rating' | 'notes' | 'watchlist' | 'favorite'>
>;

// Backend runs separately from the Vite dev server; override with VITE_API_BASE_URL for other environments.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export async function getPopularMovies(): Promise<PopularMovie[]> {
  const response = await fetch(`${API_BASE_URL}/api/movies/popular`);

  if (!response.ok) {
    throw new Error(`Failed to fetch popular movies: ${response.status}`);
  }

  return (await response.json()) as PopularMovie[];
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  const url = new URL(`${API_BASE_URL}/api/movies/search`);
  url.searchParams.set('q', query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to search movies: ${response.status}`);
  }

  return (await response.json()) as MovieSearchResult[];
}

export async function getMovieDetails(tmdbId: string | number): Promise<MovieDetails> {
  const response = await fetch(`${API_BASE_URL}/api/movies/${tmdbId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch movie details: ${response.status}`);
  }

  return (await response.json()) as MovieDetails;
}

export async function createOrGetUser(username: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log in: ${response.status}`);
  }

  return (await response.json()) as User;
}

export async function getUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return (await response.json()) as User;
}

export async function getEntry(
  userId: string,
  movieId: string | number,
): Promise<WatchEntry | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/entries/${movieId}`,
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch watch entry: ${response.status}`);
  }

  return (await response.json()) as WatchEntry;
}

export async function listEntriesForUser(userId: string): Promise<WatchEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/entries`);

  if (!response.ok) {
    throw new Error(`Failed to fetch watch entries: ${response.status}`);
  }

  return (await response.json()) as WatchEntry[];
}

export async function upsertEntry(
  userId: string,
  movieId: string | number,
  update: WatchEntryUpdate,
): Promise<WatchEntry> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/entries/${movieId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to save watch entry: ${response.status}`);
  }

  return (await response.json()) as WatchEntry;
}

