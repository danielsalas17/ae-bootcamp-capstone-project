import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovieCarousel } from "@/components/MovieCarousel";
import { MovieSearch } from "@/components/MovieSearch";

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">Letterboxd Clone</h1>
      <p className="text-muted-foreground max-w-md">
        Track the movies you&apos;ve watched, rate them, and keep personal
        notes. Search for a movie to get started.
      </p>
      {isSearchOpen ? (
        <MovieSearch onClose={() => setIsSearchOpen(false)} />
      ) : (
        <Button onClick={() => setIsSearchOpen(true)}>Search movies</Button>
      )}
      <MovieCarousel />
    </main>
  );
}

export default App;
