import { useEffect, useState } from "react";
import {
  getMovieDetails,
  type MovieDetails as MovieDetailsDto,
} from "@/lib/api";

interface MovieDetailsProps {
  tmdbId: number;
}

export function MovieDetails({ tmdbId }: MovieDetailsProps) {
  const [details, setDetails] = useState<MovieDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setDetails(null);

    getMovieDetails(tmdbId)
      .then((data) => {
        if (!cancelled) {
          setDetails(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  return (
    <section
      className="flex w-full max-w-lg flex-col gap-4 text-left"
      aria-label="Movie details"
    >
      {loading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          Something went wrong while loading this movie. Please try again.
        </p>
      )}

      {!loading && !error && details && (
        <div className="flex gap-4">
          {details.posterUrl ? (
            <img
              src={details.posterUrl}
              alt={details.title}
              className="h-48 w-32 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="h-48 w-32 shrink-0 rounded-md bg-muted" />
          )}
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{details.title}</h2>
            <p className="text-muted-foreground text-sm">
              {details.year} · {details.genres.join(", ")}
              {details.runtime ? ` · ${details.runtime} min` : ""}
            </p>
            <p className="text-sm">Rating: {details.rating.toFixed(1)}</p>
            <p className="text-sm">{details.overview}</p>
          </div>
        </div>
      )}
    </section>
  );
}
