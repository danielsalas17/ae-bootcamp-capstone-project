import { searchMoviesOnTmdb, getMovieDetailsFromTmdb } from './tmdbService';

describe('tmdbService', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.TMDB_API_KEY;

  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-api-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_API_KEY = originalApiKey;
  });

  describe('searchMoviesOnTmdb', () => {
    it('builds the search URL with the query and returns the parsed results', async () => {
      const mockedFetch = global.fetch as jest.Mock;
      mockedFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            { id: 27205, title: 'Inception', release_date: '2010-07-16', poster_path: '/poster.jpg', vote_average: 8.4 },
          ],
        }),
      });

      const results = await searchMoviesOnTmdb('inception');

      const requestedUrl = new URL(mockedFetch.mock.calls[0][0] as string);
      expect(requestedUrl.pathname).toBe('/3/search/movie');
      expect(requestedUrl.searchParams.get('query')).toBe('inception');
      expect(requestedUrl.searchParams.get('api_key')).toBe('test-api-key');
      expect(results).toEqual([
        { id: 27205, title: 'Inception', release_date: '2010-07-16', poster_path: '/poster.jpg', vote_average: 8.4 },
      ]);
    });

    it('throws when TMDB responds with a non-ok status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      await expect(searchMoviesOnTmdb('inception')).rejects.toThrow('TMDB request failed with status 500');
    });
  });

  describe('getMovieDetailsFromTmdb', () => {
    it('builds the details URL with the id and returns the parsed details', async () => {
      const mockedFetch = global.fetch as jest.Mock;
      mockedFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 27205,
          title: 'Inception',
          release_date: '2010-07-16',
          poster_path: '/poster.jpg',
          vote_average: 8.4,
          overview: 'A thief who steals corporate secrets...',
          runtime: 148,
          genres: [{ id: 28, name: 'Action' }],
        }),
      });

      const details = await getMovieDetailsFromTmdb('27205');

      const requestedUrl = new URL(mockedFetch.mock.calls[0][0] as string);
      expect(requestedUrl.pathname).toBe('/3/movie/27205');
      expect(requestedUrl.searchParams.get('api_key')).toBe('test-api-key');
      expect(details).toMatchObject({ id: 27205, title: 'Inception', runtime: 148 });
    });

    it('returns null when TMDB responds with 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

      const details = await getMovieDetailsFromTmdb('0');

      expect(details).toBeNull();
    });

    it('throws when TMDB responds with a non-404 error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      await expect(getMovieDetailsFromTmdb('27205')).rejects.toThrow('TMDB request failed with status 500');
    });
  });
});
