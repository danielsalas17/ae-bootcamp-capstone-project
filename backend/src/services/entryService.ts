import { randomUUID } from 'crypto';
import { readDb, writeDb } from '../data/db';
import type { WatchEntry } from '../types';

export type EntryUpdate = Partial<
  Pick<WatchEntry, 'watched' | 'rating' | 'notes' | 'watchlist' | 'favorite'>
>;

// Ratings are 0-5 in half-star steps; null means "no rating set".
export function isValidRating(value: unknown): value is number | null {
  if (value === null) {
    return true;
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return false;
  }
  if (value < 0 || value > 5) {
    return false;
  }
  return Number.isInteger(value * 2);
}

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
    const wasWatched = existing.watched;
    Object.assign(existing, update, { updatedAt: now });
    // watchedAt only moves on a false -> true transition of `watched`, not on unrelated edits.
    if (update.watched === true && !wasWatched) {
      existing.watchedAt = now;
    }
    writeDb(db);
    return existing;
  }

  const entry: WatchEntry = {
    id: randomUUID(),
    userId,
    imdbId,
    watched: false,
    watchedAt: null,
    rating: null,
    notes: '',
    watchlist: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...update,
  };
  if (entry.watched) {
    entry.watchedAt = now;
  }
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
