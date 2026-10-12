import { useEffect, useState } from "react";
import { getPopularMovies, type PopularMovie } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieDetailsDialog } from "@/components/MovieDetailsDialog";
import {
  movieCardInteractiveClasses,
  MoviePosterFallback,
} from "@/components/movie-card";
import { cn } from "@/lib/utils";

const SKELETON_COUNT = 4;

export function MovieCarousel() {
  const [movies, setMovies] = useState<PopularMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPopularMovies()
      .then((data) => {
        if (!cancelled) {
          setMovies(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMovies([]);
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
  }, []);

  if (!loading && movies.length === 0) {
    return null;
  }

  return (
    <section className="w-full" aria-label="Popular movies">
      <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
        Popular Movies
      </h2>

      {loading ? (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-2/3 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: "start" }}>
          <CarouselContent>
            {movies.map((movie) => (
              <CarouselItem
                key={movie.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedMovieId(movie.id)}
                  className={cn(
                    "relative block w-full text-left",
                    movieCardInteractiveClasses,
                  )}
                >
                  <div className="relative aspect-2/3 w-full">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MoviePosterFallback className="h-full w-full" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-2 pt-8">
                      <span className="line-clamp-2 text-sm leading-snug font-medium text-white">
                        {movie.title}
                      </span>
                      <span className="block text-xs tracking-wide text-white/80 uppercase">
                        {movie.year}
                      </span>
                    </div>
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
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
