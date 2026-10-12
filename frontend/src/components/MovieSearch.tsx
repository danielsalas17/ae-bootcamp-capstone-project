import { useState, type FormEvent } from "react";
import { searchMovies, type MovieSearchResult } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieDetails } from "@/components/MovieDetails";

interface MovieSearchProps {
  onClose: () => void;
}

export function MovieSearch({ onClose }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const movies = await searchMovies(trimmed);
      setResults(movies);
    } catch {
      setError(true);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  if (selectedMovieId !== null) {
    return (
      <MovieDetails
        tmdbId={selectedMovieId}
        onBack={() => setSelectedMovieId(null)}
      />
    );
  }

  return (
    <section
      className="flex w-full max-w-lg flex-col gap-4"
      aria-label="Movie search"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          autoFocus
          type="search"
          placeholder="Search by title..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search by title"
        />
        <Button type="submit">Search</Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </form>

      {loading && <p className="text-muted-foreground text-sm">Searching...</p>}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          Something went wrong while searching. Please try again.
        </p>
      )}

      {!loading && !error && results !== null && results.length === 0 && (
        <p className="text-muted-foreground text-sm">No movies found.</p>
      )}

      {!loading && !error && results !== null && results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((movie) => (
            <li key={movie.id}>
              <button
                type="button"
                onClick={() => setSelectedMovieId(movie.id)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted"
              >
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-16 w-11 rounded object-cover"
                  />
                ) : (
                  <div className="h-16 w-11 rounded bg-muted" />
                )}
                <span>
                  <span className="block font-medium">{movie.title}</span>
                  <span className="text-muted-foreground block text-sm">
                    {movie.year}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
