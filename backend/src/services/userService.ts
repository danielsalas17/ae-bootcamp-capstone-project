import { randomUUID } from 'crypto';
import { readDb, writeDb } from '../data/db';
import type { User } from '../types';

export function findUserById(userId: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.id === userId);
}

export function findUserByUsername(username: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

// "Login": returns the existing user for this username, or creates one. No password.
export function getOrCreateUser(username: string): User {
  const db = readDb();
  const existing = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return existing;
  }

  const user: User = { id: randomUUID(), username, createdAt: new Date().toISOString() };
  db.users.push(user);
  writeDb(db);
  return user;
}
