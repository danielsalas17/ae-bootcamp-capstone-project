import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecentlyWatched } from "./RecentlyWatched";
import { CurrentUserProvider } from "@/hooks/useCurrentUser";
import * as api from "@/lib/api";
import type { MovieDetails, WatchEntry } from "@/lib/api";

const CURRENT_USER = {
  id: "user-1",
  username: "alice",
  createdAt: "2024-01-01T00:00:00.000Z",
};

function entry(overrides: Partial<WatchEntry> = {}): WatchEntry {
  return {
    id: `entry-${overrides.imdbId ?? "1"}`,
    userId: "user-1",
    imdbId: "27205",
    watched: true,
    watchedAt: "2024-01-01T00:00:00.000Z",
    rating: null,
    notes: "",
    watchlist: false,
    favorite: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function movie(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    id: 27205,
    title: "Inception",
    year: "2010",
    posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
    overview: "A thief who steals corporate secrets...",
    genres: ["Action"],
    runtime: 148,
    rating: 8.4,
    ...overrides,
  };
}

function renderRecentlyWatched() {
  return render(
    <CurrentUserProvider>
      <RecentlyWatched userId="user-1" />
    </CurrentUserProvider>,
  );
}

describe("RecentlyWatched", () => {
  beforeEach(() => {
    localStorage.setItem("letterboxd-clone:userId", CURRENT_USER.id);
    vi.spyOn(api, "getUser").mockResolvedValue(CURRENT_USER);
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders watched movies newest first", async () => {
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([
      entry({ imdbId: "27205", watchedAt: "2024-01-01T00:00:00.000Z" }),
      entry({ imdbId: "155", watchedAt: "2024-03-01T00:00:00.000Z" }),
    ]);
    vi.spyOn(api, "getMovieDetails").mockImplementation(async (tmdbId) => {
      if (tmdbId === "155") {
        return movie({ id: 155, title: "The Dark Knight", year: "2008" });
      }
      return movie();
    });

    renderRecentlyWatched();

    const titles = await screen.findAllByText(/Inception|The Dark Knight/);
    expect(titles.map((el) => el.textContent)).toEqual([
      "The Dark Knight",
      "Inception",
    ]);
  });

  it("shows an empty-state message when there are no watched movies", async () => {
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([]);
    vi.spyOn(api, "getMovieDetails");

    renderRecentlyWatched();

    expect(
      await screen.findByText(/haven't marked any movies as watched/i),
    ).toBeInTheDocument();
    expect(api.getMovieDetails).not.toHaveBeenCalled();
  });

  it("sorts legacy entries without watchedAt after entries that have one", async () => {
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([
      entry({
        imdbId: "27205",
        watchedAt: null,
        updatedAt: "2024-06-01T00:00:00.000Z",
      }),
      entry({ imdbId: "155", watchedAt: "2024-03-01T00:00:00.000Z" }),
    ]);
    vi.spyOn(api, "getMovieDetails").mockImplementation(async (tmdbId) => {
      if (tmdbId === "155") {
        return movie({ id: 155, title: "The Dark Knight", year: "2008" });
      }
      return movie();
    });

    renderRecentlyWatched();

    const titles = await screen.findAllByText(/Inception|The Dark Knight/);
    expect(titles.map((el) => el.textContent)).toEqual([
      "The Dark Knight",
      "Inception",
    ]);
  });

  it("opens the details dialog for the selected movie when an item is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([entry()]);
    vi.spyOn(api, "getMovieDetails").mockResolvedValue(movie());

    renderRecentlyWatched();

    await user.click(await screen.findByRole("button", { name: /inception/i }));

    expect(api.getMovieDetails).toHaveBeenLastCalledWith(27205);
    expect(
      await screen.findByText(/thief who steals corporate secrets/i),
    ).toBeInTheDocument();
  });
});
