import { useEffect, useState } from "react";
import {
  getMovieDetails,
  type MovieDetails as MovieDetailsDto,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoviePosterFallback } from "@/components/movie-card";

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
      {loading && (
        <div className="flex gap-4" aria-busy="true">
          <Skeleton className="h-48 w-32 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )}

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
            <MoviePosterFallback className="h-48 w-32 shrink-0 rounded-md" />
          )}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {details.title}
            </h2>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              {details.year}
              {details.runtime ? ` · ${details.runtime} min` : ""}
            </p>
            <Badge className="bg-chart-1/90 text-background w-fit font-semibold">
              {details.rating.toFixed(1)}
            </Badge>
            {details.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {details.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
            <p className="line-clamp-6 text-sm leading-relaxed">
              {details.overview}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
