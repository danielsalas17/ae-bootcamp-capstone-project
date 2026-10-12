import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { CurrentUserProvider } from "@/hooks/useCurrentUser";
import * as api from "@/lib/api";

const CURRENT_USER = {
  id: "user-1",
  username: "alice",
  createdAt: "2024-01-01T00:00:00.000Z",
};

function renderDialog(props: Parameters<typeof MovieDetailsDialog>[0]) {
  return render(
    <CurrentUserProvider>
      <MovieDetailsDialog {...props} />
    </CurrentUserProvider>,
  );
}

describe("MovieDetailsDialog", () => {
  beforeEach(() => {
    localStorage.setItem("letterboxd-clone:userId", CURRENT_USER.id);
    vi.spyOn(api, "getUser").mockResolvedValue(CURRENT_USER);
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders nothing visible when closed", () => {
    renderDialog({ movieId: 27205, open: false, onOpenChange: vi.fn() });

    expect(
      document.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument();
  });

  it("shows a loading state, then the movie's details, when open", async () => {
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

    renderDialog({ movieId: 27205, open: true, onOpenChange: vi.fn() });

    expect(
      document.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument();
    expect(await screen.findByText("Inception")).toBeInTheDocument();
  });

  it("shows an error message when the details request fails", async () => {
    vi.spyOn(api, "getMovieDetails").mockRejectedValue(
      new Error("network error"),
    );

    renderDialog({ movieId: 27205, open: true, onOpenChange: vi.fn() });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
