import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCarousel } from "@/components/MovieCarousel";
import { MovieSearch } from "@/components/MovieSearch";
import { LoginScreen } from "@/components/LoginScreen";
import { CurrentUserBadge } from "@/components/CurrentUserBadge";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { CurrentUserProvider, useCurrentUser } from "@/hooks/useCurrentUser";

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)] p-8">
        <LoginScreen />
      </main>
    );
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Letterboxd Clone
          </h1>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={isSearchOpen ? "secondary" : "default"}
              aria-label="Search movies"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon />
              <span className="hidden sm:inline">Search movies</span>
            </Button>
            <CurrentUserBadge />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col space-y-12 px-4 py-8 md:px-8">
        <section aria-label="Intro">
          {isSearchOpen ? (
            <MovieSearch onClose={() => setIsSearchOpen(false)} />
          ) : (
            <p className="text-muted-foreground max-w-md">
              Track the movies you&apos;ve watched, rate them, and keep personal
              notes. Search for a movie to get started.
            </p>
          )}
        </section>
        <MovieCarousel />
        <RecentlyWatched userId={user.id} />
      </main>
    </div>
  );
}

function App() {
  return (
    <CurrentUserProvider>
      <AppContent />
    </CurrentUserProvider>
  );
}

export default App;
