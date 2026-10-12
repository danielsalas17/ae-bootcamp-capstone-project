import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MovieDetails } from "./MovieDetails";
import * as api from "@/lib/api";

describe("MovieDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders movie details on a successful fetch", async () => {
    vi.spyOn(api, "getMovieDetails").mockResolvedValue({
      id: 27205,
      title: "Inception",
      year: "2010",
      posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
      overview: "A thief who steals corporate secrets...",
      genres: ["Action", "Sci-Fi"],
      runtime: 148,
      rating: 8.4,
    });

    render(<MovieDetails tmdbId={27205} />);

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/action, sci-fi/i)).toBeInTheDocument();
    expect(screen.getByText(/148 min/i)).toBeInTheDocument();
    expect(screen.getByText(/rating: 8\.4/i)).toBeInTheDocument();
  });

  it("shows a loading state while the request is in flight", async () => {
    let resolveDetails!: (value: api.MovieDetails) => void;
    vi.spyOn(api, "getMovieDetails").mockReturnValue(
      new Promise((resolve) => {
        resolveDetails = resolve;
      }),
    );

    render(<MovieDetails tmdbId={27205} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    resolveDetails({
      id: 27205,
      title: "Inception",
      year: "2010",
      posterUrl: null,
      overview: "",
      genres: [],
      runtime: null,
      rating: 8.4,
    });
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(),
    );
  });

  it("shows an error message when the request fails", async () => {
    vi.spyOn(api, "getMovieDetails").mockRejectedValue(
      new Error("network error"),
    );

    render(<MovieDetails tmdbId={27205} />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
