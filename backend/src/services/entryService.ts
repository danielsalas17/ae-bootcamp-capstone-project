import { randomUUID } from 'crypto';
import { readDb, writeDb } from '../data/db';
import type { WatchEntry } from '../types';

export type EntryUpdate = Partial<
  Pick<WatchEntry, 'watched' | 'rating' | 'notes' | 'watchlist' | 'favorite'>
>;

export function listEntriesForUser(userId: string): WatchEntry[] {
  const db = readDb();
  return db.entries.filter((e) => e.userId === userId);
}

export function getEntry(userId: string, imdbId: string): WatchEntry | undefined {
  const db = readDb();
  return db.entries.find((e) => e.userId === userId && e.imdbId === imdbId);
}

// Creates the entry on first write, otherwise merges the update into the existing one.
export function upsertEntry(userId: string, imdbId: string, update: EntryUpdate): WatchEntry {
  const db = readDb();
  const now = new Date().toISOString();
  const existing = db.entries.find((e) => e.userId === userId && e.imdbId === imdbId);

  if (existing) {
    Object.assign(existing, update, { updatedAt: now });
    writeDb(db);
    return existing;
  }

  const entry: WatchEntry = {
    id: randomUUID(),
    userId,
    imdbId,
    watched: false,
    rating: null,
    notes: '',
    watchlist: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...update,
  };
  db.entries.push(entry);
  writeDb(db);
  return entry;
}

export function deleteEntry(userId: string, imdbId: string): boolean {
  const db = readDb();
  const index = db.entries.findIndex((e) => e.userId === userId && e.imdbId === imdbId);
  if (index === -1) {
    return false;
  }
  db.entries.splice(index, 1);
  writeDb(db);
  return true;
}
