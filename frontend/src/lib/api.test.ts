import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPopularMovies, searchMovies, getMovieDetails, createOrGetUser, getUser, getEntry, upsertEntry } from './api'

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

describe('createOrGetUser', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('posts the username and returns the created/found user', async () => {
    const user = { id: 'user-1', username: 'alice', createdAt: '2024-01-01T00:00:00.000Z' }
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await createOrGetUser('alice')

    expect(mockedFetch).toHaveBeenCalledWith('http://localhost:4000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice' }),
    })
    expect(result).toEqual(user)
  })

  it('throws when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(createOrGetUser('')).rejects.toThrow('Failed to log in: 400')
  })
})

describe('getUser', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('requests the user by id and returns parsed user', async () => {
    const user = { id: 'user-1', username: 'alice', createdAt: '2024-01-01T00:00:00.000Z' }
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await getUser('user-1')

    expect(mockedFetch).toHaveBeenCalledWith('http://localhost:4000/api/users/user-1')
    expect(result).toEqual(user)
  })

  it('throws when the response is not ok (e.g. 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(getUser('unknown')).rejects.toThrow('Failed to fetch user: 404')
  })
})

describe('getEntry', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('requests the entry by user and movie id and returns parsed entry', async () => {
    const entry = {
      id: 'entry-1',
      userId: 'user-1',
      imdbId: '27205',
      watched: true,
      rating: 4.5,
      notes: 'Great movie',
      watchlist: false,
      favorite: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => entry,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await getEntry('user-1', 27205)

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/users/user-1/entries/27205',
    )
    expect(result).toEqual(entry)
  })

  it('returns null when no entry exists yet (404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }) as unknown as typeof fetch

    const result = await getEntry('user-1', 27205)

    expect(result).toBeNull()
  })

  it('throws when the response is not ok for another reason', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(getEntry('user-1', 27205)).rejects.toThrow('Failed to fetch watch entry: 500')
  })
})

describe('upsertEntry', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('sends a PUT request with the update and returns the saved entry', async () => {
    const entry = {
      id: 'entry-1',
      userId: 'user-1',
      imdbId: '27205',
      watched: true,
      rating: 4.5,
      notes: '',
      watchlist: false,
      favorite: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => entry,
    })
    global.fetch = mockedFetch as unknown as typeof fetch

    const result = await upsertEntry('user-1', 27205, { watched: true, rating: 4.5 })

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/users/user-1/entries/27205',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched: true, rating: 4.5 }),
      },
    )
    expect(result).toEqual(entry)
  })

  it('throws when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await expect(upsertEntry('user-1', 27205, { rating: 6 })).rejects.toThrow(
      'Failed to save watch entry: 400',
    )
  })
})
