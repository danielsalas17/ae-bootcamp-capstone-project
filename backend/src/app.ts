import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users';
import { moviesRouter } from './routes/movies';
import { entriesRouter } from './routes/entries';
import { listsRouter } from './routes/lists';
import { requireUser } from './middleware/requireUser';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/users', usersRouter);
  app.use('/api/users/:userId/entries', requireUser, entriesRouter);
  app.use('/api/users/:userId/lists', requireUser, listsRouter);
  app.use('/api/movies', moviesRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
