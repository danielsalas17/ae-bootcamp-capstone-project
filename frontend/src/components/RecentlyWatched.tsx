import { useEffect, useState } from "react";
import { ClapperboardIcon } from "lucide-react";
import {
  listEntriesForUser,
  getMovieDetails,
  type MovieDetails,
  type WatchEntry,
} from "@/lib/api";
import { MovieDetailsDialog } from "@/components/MovieDetailsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  movieCardInteractiveClasses,
  MoviePosterFallback,
} from "@/components/movie-card";
import { cn } from "@/lib/utils";

interface RecentlyWatchedProps {
  userId: string;
}

interface TimelineItem {
  entry: WatchEntry;
  movie: MovieDetails;
}

const SKELETON_ROW_COUNT = 2;

function watchedOrderKey(entry: WatchEntry): string {
  return entry.watchedAt ?? entry.updatedAt;
}

function formatWatchedDate(entry: WatchEntry): string {
  return new Date(watchedOrderKey(entry)).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RecentlyWatched({ userId }: RecentlyWatchedProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listEntriesForUser(userId)
      .then(async (entries) => {
        const watchedEntries = entries.filter((entry) => entry.watched);
        const movies = await Promise.all(
          watchedEntries.map((entry) =>
            getMovieDetails(entry.imdbId).catch(() => null),
          ),
        );

        const combined = watchedEntries
          .map((entry, index) => {
            const movie = movies[index];
            return movie ? { entry, movie } : null;
          })
          .filter((item): item is TimelineItem => item !== null)
          .sort((a, b) => {
            // Entries with a real watchedAt always rank above legacy entries
            // (watchedAt: null) regardless of the legacy entry's updatedAt.
            if (a.entry.watchedAt === null && b.entry.watchedAt !== null) {
              return 1;
            }
            if (a.entry.watchedAt !== null && b.entry.watchedAt === null) {
              return -1;
            }
            return (
              new Date(watchedOrderKey(b.entry)).getTime() -
              new Date(watchedOrderKey(a.entry)).getTime()
            );
          });

        if (!cancelled) {
          setItems(combined);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
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
  }, [userId]);

  return (
    <section className="w-full" aria-label="Recently watched">
      <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
        Recently watched
      </h2>
      {loading ? (
        <ol
          className="relative flex flex-col gap-6 border-l pl-6"
          aria-busy="true"
        >
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <li key={index} className="relative">
              <span
                aria-hidden="true"
                className="bg-muted absolute top-1 -left-7.25 size-3 rounded-full"
              />
              <div className="flex items-start gap-4 p-2">
                <Skeleton className="aspect-2/3 w-16 shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <ClapperboardIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm">
            You haven&apos;t marked any movies as watched yet.
          </p>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-6 border-l pl-6">
          {items.map(({ entry, movie }) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden="true"
                className="bg-primary absolute top-1 -left-7.25 size-3 rounded-full"
              />
              <button
                type="button"
                onClick={() => setSelectedMovieId(movie.id)}
                className={cn(
                  "flex w-full items-start gap-4 p-2 text-left",
                  movieCardInteractiveClasses,
                )}
              >
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="aspect-2/3 w-16 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <MoviePosterFallback className="aspect-2/3 w-16 shrink-0 rounded-md" />
                )}
                <span className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{movie.title}</span>
                  <span className="text-muted-foreground">{movie.year}</span>
                  {entry.rating !== null && (
                    <span className="text-muted-foreground">
                      Rating: {entry.rating} / 5
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    Watched {formatWatchedDate(entry)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
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
