import request from 'supertest';
import { createApp } from '../app';
import { getPopularMoviesFromTmdb, searchMoviesOnTmdb, getMovieDetailsFromTmdb } from '../services/tmdbService';
import { resetPopularMoviesCache } from '../services/popularMoviesService';

jest.mock('../services/tmdbService');

const mockedGetPopularMoviesFromTmdb = getPopularMoviesFromTmdb as jest.MockedFunction<typeof getPopularMoviesFromTmdb>;
const mockedSearchMoviesOnTmdb = searchMoviesOnTmdb as jest.MockedFunction<typeof searchMoviesOnTmdb>;
const mockedGetMovieDetailsFromTmdb = getMovieDetailsFromTmdb as jest.MockedFunction<typeof getMovieDetailsFromTmdb>;

describe('GET /api/movies/popular', () => {
  const app = createApp();

  beforeEach(() => {
    resetPopularMoviesCache();
  });

  it('returns a 200 with resolved movie details', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([
      { id: 1, title: 'Inception', release_date: '2010-07-16', poster_path: '/poster.jpg', vote_average: 8.8 },
    ]);

    const res = await request(app).get('/api/movies/popular');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    for (const movie of res.body) {
      expect(movie).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        year: expect.any(String),
        posterUrl: expect.any(String),
        rating: expect.any(Number),
      });
    }
  });

  it('omits entries with no poster but still returns 200', async () => {
    mockedGetPopularMoviesFromTmdb.mockResolvedValue([
      { id: 1, title: 'Inception', release_date: '2010-07-16', poster_path: '/poster.jpg', vote_average: 8.8 },
      { id: 2, title: 'No Poster Movie', release_date: '2020-01-01', poster_path: null, vote_average: 5.0 },
    ]);

    const res = await request(app).get('/api/movies/popular');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(1);
  });

  it('returns a 500 when TMDB fails and there is no cached data', async () => {
    mockedGetPopularMoviesFromTmdb.mockRejectedValue(new Error('TMDB request failed'));

    const res = await request(app).get('/api/movies/popular');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/movies/search', () => {
  const app = createApp();

  it('returns a 200 with resolved search results', async () => {
    mockedSearchMoviesOnTmdb.mockResolvedValue([
      { id: 27205, title: 'Inception', release_date: '2010-07-16', poster_path: '/poster.jpg', vote_average: 8.4 },
    ]);

    const res = await request(app).get('/api/movies/search').query({ q: 'inception' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 27205, title: 'Inception', year: '2010', posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg' },
    ]);
    expect(mockedSearchMoviesOnTmdb).toHaveBeenCalledWith('inception');
  });

  it('returns a 200 with an empty array when there are no matches', async () => {
    mockedSearchMoviesOnTmdb.mockResolvedValue([]);

    const res = await request(app).get('/api/movies/search').query({ q: 'no-such-movie' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns a 400 when q is missing', async () => {
    const res = await request(app).get('/api/movies/search');

    expect(res.status).toBe(400);
    expect(mockedSearchMoviesOnTmdb).not.toHaveBeenCalled();
  });

  it('returns a 400 when q is blank', async () => {
    const res = await request(app).get('/api/movies/search').query({ q: '   ' });

    expect(res.status).toBe(400);
    expect(mockedSearchMoviesOnTmdb).not.toHaveBeenCalled();
  });

  it('returns a 500 when TMDB fails', async () => {
    mockedSearchMoviesOnTmdb.mockRejectedValue(new Error('TMDB request failed'));

    const res = await request(app).get('/api/movies/search').query({ q: 'inception' });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/movies/:tmdbId', () => {
  const app = createApp();

  it('returns a 200 with resolved movie details', async () => {
    mockedGetMovieDetailsFromTmdb.mockResolvedValue({
      id: 27205,
      title: 'Inception',
      release_date: '2010-07-16',
      poster_path: '/poster.jpg',
      vote_average: 8.4,
      overview: 'A thief who steals corporate secrets...',
      runtime: 148,
      genres: [{ id: 28, name: 'Action' }],
    });

    const res = await request(app).get('/api/movies/27205');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 27205,
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      overview: 'A thief who steals corporate secrets...',
      genres: ['Action'],
      runtime: 148,
      rating: 8.4,
    });
    expect(mockedGetMovieDetailsFromTmdb).toHaveBeenCalledWith('27205');
  });

  it('returns a 404 when the movie is not found', async () => {
    mockedGetMovieDetailsFromTmdb.mockResolvedValue(null);

    const res = await request(app).get('/api/movies/0');

    expect(res.status).toBe(404);
  });

  it('returns a 500 when TMDB fails', async () => {
    mockedGetMovieDetailsFromTmdb.mockRejectedValue(new Error('TMDB request failed'));

    const res = await request(app).get('/api/movies/27205');

    expect(res.status).toBe(500);
  });
});
