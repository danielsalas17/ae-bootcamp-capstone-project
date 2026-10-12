import { searchMoviesOnTmdb, getMovieDetailsFromTmdb, type TmdbMovie, type TmdbMovieDetails } from './tmdbService';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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

function toPosterUrl(posterPath: string | null): string | null {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : null;
}

function toYear(releaseDate: string): string {
  return releaseDate ? releaseDate.slice(0, 4) : '';
}

function toMovieSearchResult(movie: TmdbMovie): MovieSearchResult {
  return {
    id: movie.id,
    title: movie.title,
    year: toYear(movie.release_date),
    posterUrl: toPosterUrl(movie.poster_path),
  };
}

function toMovieDetails(movie: TmdbMovieDetails): MovieDetails {
  return {
    id: movie.id,
    title: movie.title,
    year: toYear(movie.release_date),
    posterUrl: toPosterUrl(movie.poster_path),
    overview: movie.overview,
    genres: movie.genres.map((genre) => genre.name),
    runtime: movie.runtime,
    rating: movie.vote_average,
  };
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  const movies = await searchMoviesOnTmdb(query);
  return movies.map(toMovieSearchResult);
}

export async function getMovieDetails(tmdbId: string): Promise<MovieDetails | null> {
  const movie = await getMovieDetailsFromTmdb(tmdbId);
  return movie ? toMovieDetails(movie) : null;
}
