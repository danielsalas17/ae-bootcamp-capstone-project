import { randomUUID } from 'crypto';
import { readDb, writeDb } from '../data/db';
import type { MovieList } from '../types';

export function listListsForUser(userId: string): MovieList[] {
  const db = readDb();
  return db.lists.filter((l) => l.userId === userId);
}

export function getList(userId: string, listId: string): MovieList | undefined {
  const db = readDb();
  return db.lists.find((l) => l.userId === userId && l.id === listId);
}

export function createList(userId: string, name: string): MovieList {
  const db = readDb();
  const now = new Date().toISOString();
  const list: MovieList = { id: randomUUID(), userId, name, movieIds: [], createdAt: now, updatedAt: now };
  db.lists.push(list);
  writeDb(db);
  return list;
}

export function renameList(userId: string, listId: string, name: string): MovieList | undefined {
  const db = readDb();
  const list = db.lists.find((l) => l.userId === userId && l.id === listId);
  if (!list) {
    return undefined;
  }
  list.name = name;
  list.updatedAt = new Date().toISOString();
  writeDb(db);
  return list;
}

export function deleteList(userId: string, listId: string): boolean {
  const db = readDb();
  const index = db.lists.findIndex((l) => l.userId === userId && l.id === listId);
  if (index === -1) {
    return false;
  }
  db.lists.splice(index, 1);
  writeDb(db);
  return true;
}

export function addMovieToList(userId: string, listId: string, imdbId: string): MovieList | undefined {
  const db = readDb();
  const list = db.lists.find((l) => l.userId === userId && l.id === listId);
  if (!list) {
    return undefined;
  }
  if (!list.movieIds.includes(imdbId)) {
    list.movieIds.push(imdbId);
    list.updatedAt = new Date().toISOString();
    writeDb(db);
  }
  return list;
}

export function removeMovieFromList(userId: string, listId: string, imdbId: string): MovieList | undefined {
  const db = readDb();
  const list = db.lists.find((l) => l.userId === userId && l.id === listId);
  if (!list) {
    return undefined;
  }
  list.movieIds = list.movieIds.filter((id) => id !== imdbId);
  list.updatedAt = new Date().toISOString();
  writeDb(db);
  return list;
}
