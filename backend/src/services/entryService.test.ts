import fs from 'fs';
import os from 'os';
import path from 'path';
import { upsertEntry, getEntry, deleteEntry, listEntriesForUser, isValidRating } from './entryService';

describe('isValidRating', () => {
  it.each([0, 0.5, 5, null])('accepts %s', (value) => {
    expect(isValidRating(value)).toBe(true);
  });

  it.each([-1, 5.5, 3.25, 6])('rejects %s', (value) => {
    expect(isValidRating(value)).toBe(false);
  });
});

describe('entryService', () => {
  let dbFilePath: string;

  beforeEach(() => {
    dbFilePath = path.join(os.tmpdir(), `entry-service-${Date.now()}-${Math.random()}.json`);
    process.env.DB_FILE_PATH = dbFilePath;
  });

  afterEach(() => {
    if (fs.existsSync(dbFilePath)) {
      fs.unlinkSync(dbFilePath);
    }
    delete process.env.DB_FILE_PATH;
  });

  it('creates a new entry on first upsert', () => {
    const entry = upsertEntry('user-1', 'tt0111161', { watched: true, rating: 9 });

    expect(entry.userId).toBe('user-1');
    expect(entry.imdbId).toBe('tt0111161');
    expect(entry.watched).toBe(true);
    expect(entry.rating).toBe(9);
    expect(getEntry('user-1', 'tt0111161')).toEqual(entry);
  });

  it('merges updates into an existing entry', () => {
    upsertEntry('user-1', 'tt0111161', { watched: true });
    const updated = upsertEntry('user-1', 'tt0111161', { notes: 'Great movie' });

    expect(updated.watched).toBe(true);
    expect(updated.notes).toBe('Great movie');
  });

  it('deletes an entry', () => {
    upsertEntry('user-1', 'tt0111161', { favorite: true });

    expect(deleteEntry('user-1', 'tt0111161')).toBe(true);
    expect(getEntry('user-1', 'tt0111161')).toBeUndefined();
  });

  it('scopes entries per user', () => {
    upsertEntry('user-1', 'tt0111161', { watchlist: true });
    upsertEntry('user-2', 'tt0068646', { watchlist: true });

    expect(listEntriesForUser('user-1')).toHaveLength(1);
    expect(listEntriesForUser('user-2')).toHaveLength(1);
  });
});
