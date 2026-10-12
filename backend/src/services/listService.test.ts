import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  createList,
  getList,
  renameList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
  listListsForUser,
} from './listService';

describe('listService', () => {
  let dbFilePath: string;

  beforeEach(() => {
    dbFilePath = path.join(os.tmpdir(), `list-service-${Date.now()}-${Math.random()}.json`);
    process.env.DB_FILE_PATH = dbFilePath;
  });

  afterEach(() => {
    if (fs.existsSync(dbFilePath)) {
      fs.unlinkSync(dbFilePath);
    }
    delete process.env.DB_FILE_PATH;
  });

  it('creates and fetches a list scoped to a user', () => {
    const list = createList('user-1', 'Favorites 2026');

    expect(list.userId).toBe('user-1');
    expect(list.movieIds).toEqual([]);
    expect(getList('user-1', list.id)).toEqual(list);
  });

  it('adds and removes movies from a list', () => {
    const list = createList('user-1', 'Watch later');

    const withMovie = addMovieToList('user-1', list.id, 'tt0111161');
    expect(withMovie?.movieIds).toContain('tt0111161');

    const withoutMovie = removeMovieFromList('user-1', list.id, 'tt0111161');
    expect(withoutMovie?.movieIds).not.toContain('tt0111161');
  });

  it('renames a list', () => {
    const list = createList('user-1', 'Old name');
    const renamed = renameList('user-1', list.id, 'New name');

    expect(renamed?.name).toBe('New name');
  });

  it('deletes a list', () => {
    const list = createList('user-1', 'To delete');

    expect(deleteList('user-1', list.id)).toBe(true);
    expect(getList('user-1', list.id)).toBeUndefined();
  });

  it('scopes lists per user', () => {
    createList('user-1', 'List A');
    createList('user-2', 'List B');

    expect(listListsForUser('user-1')).toHaveLength(1);
    expect(listListsForUser('user-2')).toHaveLength(1);
  });
});
