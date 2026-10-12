import request from 'supertest';
import { createApp } from '../app';
import { getPopularMoviesFromTmdb } from '../services/tmdbService';
import { resetPopularMoviesCache } from '../services/popularMoviesService';

jest.mock('../services/tmdbService');

const mockedGetPopularMoviesFromTmdb = getPopularMoviesFromTmdb as jest.MockedFunction<typeof getPopularMoviesFromTmdb>;

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
