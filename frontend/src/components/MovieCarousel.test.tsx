import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCarousel } from "./MovieCarousel";
import { CurrentUserProvider } from "@/hooks/useCurrentUser";
import * as api from "@/lib/api";

const CURRENT_USER = {
  id: "user-1",
  username: "alice",
  createdAt: "2024-01-01T00:00:00.000Z",
};

function renderCarousel() {
  return render(
    <CurrentUserProvider>
      <MovieCarousel />
    </CurrentUserProvider>,
  );
}

describe("MovieCarousel", () => {
  beforeEach(() => {
    localStorage.setItem("letterboxd-clone:userId", CURRENT_USER.id);
    vi.spyOn(api, "getUser").mockResolvedValue(CURRENT_USER);
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders movie items on a successful fetch", async () => {
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([
      {
        id: 27205,
        title: "Inception",
        year: "2010",
        posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
        rating: 8.8,
      },
      {
        id: 155,
        title: "The Dark Knight",
        year: "2008",
        posterUrl: "https://image.tmdb.org/t/p/w500/poster2.jpg",
        rating: 9.0,
      },
    ]);

    renderCarousel();

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
  });

  it("renders nothing when the fetch fails", async () => {
    vi.spyOn(api, "getPopularMovies").mockRejectedValue(
      new Error("network error"),
    );

    const { container } = renderCarousel();

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the fetch returns an empty list", async () => {
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);

    const { container } = renderCarousel();

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("opens the details dialog for the selected movie when a poster is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([
      {
        id: 27205,
        title: "Inception",
        year: "2010",
        posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
        rating: 8.8,
      },
    ]);
    vi.spyOn(api, "getMovieDetails").mockResolvedValue({
      id: 27205,
      title: "Inception",
      year: "2010",
      posterUrl: null,
      overview: "A thief who steals corporate secrets...",
      genres: ["Action"],
      runtime: 148,
      rating: 8.4,
    });

    renderCarousel();

    await user.click(await screen.findByRole("button", { name: /inception/i }));

    expect(api.getMovieDetails).toHaveBeenCalledWith(27205);
    expect(
      await screen.findByText(/thief who steals corporate secrets/i),
    ).toBeInTheDocument();
  });
});
