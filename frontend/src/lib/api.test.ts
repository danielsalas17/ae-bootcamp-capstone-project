import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPopularMovies, searchMovies, getMovieDetails } from './api'

describe('getPopularMovies', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('returns parsed movies on a successful response', async () => {
    const movies = [
      { id: 27205, title: 'Inception', year: '2010', posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg', rating: 8.8 },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => movies,
    }) as unknown as typeof fetch

    const result = await getPopularMovies()

    expect(result).toEqual(movies)
  })

  it('throws when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(getPopularMovies()).rejects.toThrow('Failed to fetch popular movies: 500')
  })
})

describe('searchMovies', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('requests the search endpoint with the query and returns parsed results', async () => {
    const results = [
      { id: 27205, title: 'Inception', year: '2010', posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg' },
    ]
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => results,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await searchMovies('inception')

    const requestedUrl = new URL(mockedFetch.mock.calls[0][0] as string)
    expect(requestedUrl.pathname).toBe('/api/movies/search')
    expect(requestedUrl.searchParams.get('q')).toBe('inception')
    expect(result).toEqual(results)
  })

  it('returns an empty array when there are no matches', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch

    const result = await searchMovies('no-such-movie')

    expect(result).toEqual([])
  })

  it('throws when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(searchMovies('inception')).rejects.toThrow('Failed to search movies: 500')
  })
})

describe('getMovieDetails', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('requests movie details by id and returns parsed details', async () => {
    const details = {
      id: 27205,
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      overview: 'A thief who steals corporate secrets...',
      genres: ['Action'],
      runtime: 148,
      rating: 8.4,
    }
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => details,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await getMovieDetails(27205)

    expect(mockedFetch).toHaveBeenCalledWith('http://localhost:4000/api/movies/27205')
    expect(result).toEqual(details)
  })

  it('throws when the response is not ok (e.g. 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(getMovieDetails(0)).rejects.toThrow('Failed to fetch movie details: 404')
  })
})
