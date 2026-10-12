import { searchMoviesOnTmdb, getMovieDetailsFromTmdb, type TmdbMovie, type TmdbMovieDetails } from './tmdbService';
import { searchMovies, getMovieDetails } from './movieSearchService';

jest.mock('./tmdbService');

const mockedSearchMoviesOnTmdb = searchMoviesOnTmdb as jest.MockedFunction<typeof searchMoviesOnTmdb>;
const mockedGetMovieDetailsFromTmdb = getMovieDetailsFromTmdb as jest.MockedFunction<typeof getMovieDetailsFromTmdb>;

function tmdbMovie(id: number, overrides: Partial<TmdbMovie> = {}): TmdbMovie {
  return {
    id,
    title: `Movie ${id}`,
    release_date: '2020-01-15',
    poster_path: `/poster-${id}.jpg`,
    vote_average: 8.0,
    ...overrides,
  };
}

function tmdbMovieDetails(overrides: Partial<TmdbMovieDetails> = {}): TmdbMovieDetails {
  return {
    id: 27205,
    title: 'Inception',
    release_date: '2010-07-16',
    poster_path: '/poster.jpg',
    vote_average: 8.4,
    overview: 'A thief who steals corporate secrets...',
    runtime: 148,
    genres: [{ id: 28, name: 'Action' }],
    ...overrides,
  };
}

describe('movieSearchService', () => {
  describe('searchMovies', () => {
    it('maps TMDB search results into the normalized shape', async () => {
      mockedSearchMoviesOnTmdb.mockResolvedValue([tmdbMovie(1), tmdbMovie(2)]);

      const results = await searchMovies('inception');

      expect(results).toEqual([
        { id: 1, title: 'Movie 1', year: '2020', posterUrl: 'https://image.tmdb.org/t/p/w500/poster-1.jpg' },
        { id: 2, title: 'Movie 2', year: '2020', posterUrl: 'https://image.tmdb.org/t/p/w500/poster-2.jpg' },
      ]);
    });

    it('returns a null posterUrl instead of dropping the result when there is no poster', async () => {
      mockedSearchMoviesOnTmdb.mockResolvedValue([tmdbMovie(1, { poster_path: null })]);

      const results = await searchMovies('inception');

      expect(results).toEqual([{ id: 1, title: 'Movie 1', year: '2020', posterUrl: null }]);
    });

    it('returns an empty array when there are no matches', async () => {
      mockedSearchMoviesOnTmdb.mockResolvedValue([]);

      const results = await searchMovies('no-such-movie');

      expect(results).toEqual([]);
    });
  });

  describe('getMovieDetails', () => {
    it('maps TMDB movie details into the normalized shape', async () => {
      mockedGetMovieDetailsFromTmdb.mockResolvedValue(tmdbMovieDetails());

      const details = await getMovieDetails('27205');

      expect(details).toEqual({
        id: 27205,
        title: 'Inception',
        year: '2010',
        posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
        overview: 'A thief who steals corporate secrets...',
        genres: ['Action'],
        runtime: 148,
        rating: 8.4,
      });
    });

    it('returns null when TMDB has no matching movie', async () => {
      mockedGetMovieDetailsFromTmdb.mockResolvedValue(null);

      const details = await getMovieDetails('0');

      expect(details).toBeNull();
    });
  });
});
