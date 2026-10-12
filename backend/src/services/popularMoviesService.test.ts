import { getPopularMoviesFromTmdb, type TmdbMovie } from './tmdbService';
import { getPopularMovies, resetPopularMoviesCache } from './popularMoviesService';

jest.mock('./tmdbService');

const mockedGetPopularMoviesFromTmdb = getPopularMoviesFromTmdb as jest.MockedFunction<typeof getPopularMoviesFromTmdb>;

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

describe('popularMoviesService', () => {
  beforeEach(() => {
    resetPopularMoviesCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('maps TMDB results into the normalized shape on a cold cache', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1), tmdbMovie(2)]);

    const movies = await getPopularMovies();

    expect(movies).toEqual([
      { id: 1, title: 'Movie 1', year: '2020', posterUrl: 'https://image.tmdb.org/t/p/w500/poster-1.jpg', rating: 8.0 },
      { id: 2, title: 'Movie 2', year: '2020', posterUrl: 'https://image.tmdb.org/t/p/w500/poster-2.jpg', rating: 8.0 },
    ]);
    expect(mockedGetPopularMoviesFromTmdb).toHaveBeenCalledTimes(1);
  });

  it('filters out entries with no poster image', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1), tmdbMovie(2, { poster_path: null })]);

    const movies = await getPopularMovies();

    expect(movies).toHaveLength(1);
    expect(movies[0].id).toBe(1);
  });

  it('serves the cached result on a repeated call within the TTL window', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1)]);

    await getPopularMovies();
    mockedGetPopularMoviesFromTmdb.mockClear();
    const second = await getPopularMovies();

    expect(mockedGetPopularMoviesFromTmdb).not.toHaveBeenCalled();
    expect(second).toHaveLength(1);
  });

  it('refreshes the cache after the TTL window elapses', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1)]);

    await getPopularMovies();
    jest.setSystemTime(Date.now() + 6 * 60 * 60 * 1000 + 1000);
    mockedGetPopularMoviesFromTmdb.mockClear();
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1), tmdbMovie(2)]);
    const movies = await getPopularMovies();

    expect(mockedGetPopularMoviesFromTmdb).toHaveBeenCalledTimes(1);
    expect(movies).toHaveLength(2);
  });

  it('propagates an error when TMDB fails and there is no cached data', async () => {
    mockedGetPopularMoviesFromTmdb.mockRejectedValue(new Error('TMDB request failed'));

    await expect(getPopularMovies()).rejects.toThrow('TMDB request failed');
  });

  it('serves stale cached data when TMDB fails after the cache has expired', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([tmdbMovie(1)]);
    await getPopularMovies();

    jest.setSystemTime(Date.now() + 6 * 60 * 60 * 1000 + 1000);
    mockedGetPopularMoviesFromTmdb.mockRejectedValue(new Error('TMDB request failed'));

    const movies = await getPopularMovies();

    expect(movies).toHaveLength(1);
    expect(movies[0].id).toBe(1);
  });
});
