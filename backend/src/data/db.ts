import fs from 'fs';
import path from 'path';
import type { Database } from '../types';

// Overridable via DB_FILE_PATH so tests never touch the real data file.
function getDbPath(): string {
  return process.env.DB_FILE_PATH
    ? path.resolve(process.env.DB_FILE_PATH)
    : path.resolve(process.cwd(), 'data', 'db.json');
}

const emptyDatabase: Database = { users: [], entries: [], lists: [] };

function ensureDbFile(): void {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(emptyDatabase, null, 2));
  }
}

export function readDb(): Database {
  ensureDbFile();
  const raw = fs.readFileSync(getDbPath(), 'utf-8');
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database): void {
  fs.writeFileSync(getDbPath(), JSON.stringify(db, null, 2));
}
