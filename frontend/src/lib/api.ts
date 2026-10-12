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
