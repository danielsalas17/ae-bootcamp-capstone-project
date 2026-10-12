const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
}

interface TmdbPopularMoviesResponse {
  results: TmdbMovie[];
}

interface TmdbSearchMoviesResponse {
  results: TmdbMovie[];
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is not set in the environment');
  }
  return key;
}

export async function getPopularMoviesFromTmdb(): Promise<TmdbMovie[]> {
  const url = new URL(`${TMDB_BASE_URL}/movie/popular`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', '1');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  const data = (await response.json()) as TmdbPopularMoviesResponse;
  return data.results;
}

export async function searchMoviesOnTmdb(query: string): Promise<TmdbMovie[]> {
  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('query', query);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  const data = (await response.json()) as TmdbSearchMoviesResponse;
  return data.results;
}

export async function getMovieDetailsFromTmdb(tmdbId: string): Promise<TmdbMovieDetails | null> {
  const url = new URL(`${TMDB_BASE_URL}/movie/${encodeURIComponent(tmdbId)}`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');

  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return (await response.json()) as TmdbMovieDetails;
}
