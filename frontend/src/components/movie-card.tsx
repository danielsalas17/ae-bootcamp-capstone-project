import { FilmIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared card surface used by every movie entry (carousel, search, recently-watched). */
export const movieCardSurfaceClasses =
  "bg-card rounded-xl ring-1 ring-border/60 shadow-sm overflow-hidden";

/** Surface classes plus hover/focus feedback for clickable movie cards. */
export const movieCardInteractiveClasses = cn(
  movieCardSurfaceClasses,
  "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

interface MoviePosterFallbackProps {
  className?: string;
}

/** Placeholder shown in place of a poster image when no poster URL is available. */
export function MoviePosterFallback({ className }: MoviePosterFallbackProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className,
      )}
    >
      <FilmIcon className="size-8" aria-hidden="true" />
    </div>
  );
}
