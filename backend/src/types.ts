export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface WatchEntry {
  id: string;
  userId: string;
  imdbId: string;
  watched: boolean;
  watchedAt: string | null;
  rating: number | null;
  notes: string;
  watchlist: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MovieList {
  id: string;
  userId: string;
  name: string;
  movieIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  users: User[];
  entries: WatchEntry[];
  lists: MovieList[];
}
