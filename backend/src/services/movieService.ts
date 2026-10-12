const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbMovieDetails extends OmdbSearchResult {
  Plot: string;
  Director: string;
  Actors: string;
  Genre: string;
  Runtime: string;
  imdbRating: string;
}

function getApiKey(): string {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    throw new Error('OMDB_API_KEY is not set in the environment');
  }
  return key;
}

export async function searchMovies(query: string): Promise<OmdbSearchResult[]> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set('apikey', getApiKey());
  url.searchParams.set('s', query);
  url.searchParams.set('type', 'movie');

  const response = await fetch(url);
  const data = (await response.json()) as { Response: string; Search?: OmdbSearchResult[] };

  if (data.Response === 'False') {
    return [];
  }

  return data.Search ?? [];
}

export async function getMovieDetails(imdbId: string): Promise<OmdbMovieDetails | null> {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set('apikey', getApiKey());
  url.searchParams.set('i', imdbId);
  url.searchParams.set('plot', 'full');

  const response = await fetch(url);
  const data = (await response.json()) as OmdbMovieDetails & { Response: string };

  if (data.Response === 'False') {
    return null;
  }

  return data;
}
