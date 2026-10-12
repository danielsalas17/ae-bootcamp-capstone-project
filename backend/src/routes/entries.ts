import { Router } from 'express';
import {
  listEntriesForUser,
  getEntry,
  upsertEntry,
  deleteEntry,
  isValidRating,
  type EntryUpdate,
} from '../services/entryService';

interface EntryParams {
  userId: string;
  imdbId: string;
}

export const entriesRouter = Router({ mergeParams: true });

entriesRouter.get<Pick<EntryParams, 'userId'>>('/', (req, res) => {
  res.json(listEntriesForUser(req.params.userId));
});

entriesRouter.get<EntryParams>('/:imdbId', (req, res) => {
  const entry = getEntry(req.params.userId, req.params.imdbId);
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.json(entry);
});

entriesRouter.put<EntryParams>('/:imdbId', (req, res) => {
  const update = req.body as EntryUpdate;
  if ('rating' in update && !isValidRating(update.rating)) {
    res.status(400).json({ error: 'rating must be null or a multiple of 0.5 between 0 and 5' });
    return;
  }
  const entry = upsertEntry(req.params.userId, req.params.imdbId, update);
  res.json(entry);
});


entriesRouter.delete<EntryParams>('/:imdbId', (req, res) => {
  const deleted = deleteEntry(req.params.userId, req.params.imdbId);
  if (!deleted) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.status(204).send();
});
