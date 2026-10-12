import { Router } from 'express';
import {
  listListsForUser,
  getList,
  createList,
  renameList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
} from '../services/listService';

interface UserParams {
  userId: string;
}

interface ListParams extends UserParams {
  listId: string;
}

interface ListMovieParams extends ListParams {
  imdbId: string;
}

export const listsRouter = Router({ mergeParams: true });

listsRouter.get<UserParams>('/', (req, res) => {
  res.json(listListsForUser(req.params.userId));
});

listsRouter.post<UserParams>('/', (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  res.status(201).json(createList(req.params.userId, name.trim()));
});

listsRouter.get<ListParams>('/:listId', (req, res) => {
  const list = getList(req.params.userId, req.params.listId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.json(list);
});

listsRouter.patch<ListParams>('/:listId', (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const list = renameList(req.params.userId, req.params.listId, name.trim());
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.json(list);
});

listsRouter.delete<ListParams>('/:listId', (req, res) => {
  const deleted = deleteList(req.params.userId, req.params.listId);
  if (!deleted) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.status(204).send();
});

listsRouter.post<ListParams>('/:listId/movies', (req, res) => {
  const { imdbId } = req.body as { imdbId?: string };
  if (!imdbId) {
    res.status(400).json({ error: 'imdbId is required' });
    return;
  }
  const list = addMovieToList(req.params.userId, req.params.listId, imdbId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.json(list);
});

listsRouter.delete<ListMovieParams>('/:listId/movies/:imdbId', (req, res) => {
  const list = removeMovieFromList(req.params.userId, req.params.listId, req.params.imdbId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }
  res.json(list);
});
