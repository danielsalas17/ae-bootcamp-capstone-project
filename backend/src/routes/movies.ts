import { Router } from 'express';
import { searchMovies, getMovieDetails } from '../services/movieSearchService';
import { getPopularMovies } from '../services/popularMoviesService';

export const moviesRouter = Router();

// Must be registered before '/:tmdbId' so 'popular' isn't matched as a tmdbId.
moviesRouter.get('/popular', async (_req, res, next) => {
  try {
    const movies = await getPopularMovies();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

moviesRouter.get('/search', async (req, res, next) => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) {
    res.status(400).json({ error: 'q query parameter is required' });
    return;
  }
  try {
    const results = await searchMovies(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

moviesRouter.get('/:tmdbId', async (req, res, next) => {
  try {
    const movie = await getMovieDetails(req.params.tmdbId);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});
