import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPopularMovies } from './api'

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
