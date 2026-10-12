export interface PopularMovie {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  rating: number;
}

// Backend runs separately from the Vite dev server; override with VITE_API_BASE_URL for other environments.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export async function getPopularMovies(): Promise<PopularMovie[]> {
  const response = await fetch(`${API_BASE_URL}/api/movies/popular`);

  if (!response.ok) {
    throw new Error(`Failed to fetch popular movies: ${response.status}`);
  }

  return (await response.json()) as PopularMovie[];
}
