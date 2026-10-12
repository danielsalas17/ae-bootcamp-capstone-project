import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MovieCarousel } from "./MovieCarousel";
import * as api from "@/lib/api";

describe("MovieCarousel", () => {
  afterEach(() => {
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

    render(<MovieCarousel />);

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
  });

  it("renders nothing when the fetch fails", async () => {
    vi.spyOn(api, "getPopularMovies").mockRejectedValue(
      new Error("network error"),
    );

    const { container } = render(<MovieCarousel />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the fetch returns an empty list", async () => {
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);

    const { container } = render(<MovieCarousel />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
