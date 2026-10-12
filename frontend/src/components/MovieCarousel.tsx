import { useEffect, useState } from "react";
import { getPopularMovies, type PopularMovie } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function MovieCarousel() {
  const [movies, setMovies] = useState<PopularMovie[]>([]);

  useEffect(() => {
    let cancelled = false;

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
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl" aria-label="Popular movies">
      <h2 className="mb-4 text-xl font-semibold">Popular Movies</h2>
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {movies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4"
            >
              <figure className="flex flex-col gap-2">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="aspect-2/3 w-full rounded-md object-cover"
                />
                <figcaption className="text-sm">
                  <p className="truncate font-medium">{movie.title}</p>
                  <p className="text-muted-foreground">{movie.year}</p>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
