import { useState, type FormEvent } from "react";
import { SearchXIcon } from "lucide-react";
import { searchMovies, type MovieSearchResult } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieDetailsDialog } from "@/components/MovieDetailsDialog";
import {
  movieCardInteractiveClasses,
  MoviePosterFallback,
} from "@/components/movie-card";
import { cn } from "@/lib/utils";

interface MovieSearchProps {
  onClose: () => void;
}

const SKELETON_ROW_COUNT = 3;

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

      {loading && (
        <ul className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 p-2">
              <Skeleton className="h-16 w-11 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          Something went wrong while searching. Please try again.
        </p>
      )}

      {!loading && !error && results !== null && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <SearchXIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm">No movies found.</p>
        </div>
      )}

      {!loading && !error && results !== null && results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((movie) => (
            <li key={movie.id}>
              <button
                type="button"
                onClick={() => setSelectedMovieId(movie.id)}
                className={cn(
                  "flex w-full items-center gap-3 p-2 text-left",
                  movieCardInteractiveClasses,
                )}
              >
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-16 w-11 shrink-0 rounded object-cover"
                  />
                ) : (
                  <MoviePosterFallback className="h-16 w-11 shrink-0 rounded" />
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

      <MovieDetailsDialog
        movieId={selectedMovieId}
        open={selectedMovieId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMovieId(null);
          }
        }}
      />
    </section>
  );
}
