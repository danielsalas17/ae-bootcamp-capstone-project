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
