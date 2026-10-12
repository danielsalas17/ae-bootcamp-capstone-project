import { getPopularMoviesFromTmdb, type TmdbMovie } from './tmdbService';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface PopularMovie {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  rating: number;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

let cache: { data: PopularMovie[]; expiresAt: number } | null = null;

function toPopularMovie(movie: TmdbMovie): PopularMovie | null {
  if (!movie.poster_path) {
    return null;
  }

  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.slice(0, 4) : '',
    posterUrl: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
    rating: movie.vote_average,
  };
}

async function resolvePopularMovies(): Promise<PopularMovie[]> {
  const movies = await getPopularMoviesFromTmdb();
  return movies
    .map(toPopularMovie)
    .filter((movie): movie is PopularMovie => movie !== null);
}

export async function getPopularMovies(): Promise<PopularMovie[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  try {
    const data = await resolvePopularMovies();
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return data;
  } catch (err) {
    if (cache) {
      return cache.data;
    }
    throw err;
  }
}

// Test-only seam: lets tests exercise cache-miss/refresh behavior deterministically.
export function resetPopularMoviesCache(): void {
  cache = null;
}
