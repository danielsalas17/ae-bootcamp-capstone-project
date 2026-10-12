import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieSearch } from "./MovieSearch";
import * as api from "@/lib/api";

describe("MovieSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits the typed query and renders results", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "searchMovies").mockResolvedValue([
      { id: 27205, title: "Inception", year: "2010", posterUrl: null },
    ]);

    render(<MovieSearch onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/search by title/i), "inception");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(api.searchMovies).toHaveBeenCalledWith("inception");
  });

  it("shows a loading state while the search request is in flight", async () => {
    const user = userEvent.setup();
    let resolveSearch!: (value: api.MovieSearchResult[]) => void;
    vi.spyOn(api, "searchMovies").mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );

    render(<MovieSearch onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/search by title/i), "inception");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByText(/searching/i)).toBeInTheDocument();

    resolveSearch([]);
    await waitFor(() =>
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument(),
    );
  });

  it("shows an error message when the search request fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "searchMovies").mockRejectedValue(new Error("network error"));

    render(<MovieSearch onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/search by title/i), "inception");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows a no-results message when the search returns an empty array", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "searchMovies").mockResolvedValue([]);

    render(<MovieSearch onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/search by title/i), "nonexistent");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByText(/no movies found/i)).toBeInTheDocument();
  });

  it("opens movie details when a result is selected and can navigate back", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "searchMovies").mockResolvedValue([
      { id: 27205, title: "Inception", year: "2010", posterUrl: null },
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

    render(<MovieSearch onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/search by title/i), "inception");
    await user.click(screen.getByRole("button", { name: /^search$/i }));
    await user.click(await screen.findByRole("button", { name: /inception/i }));

    expect(api.getMovieDetails).toHaveBeenCalledWith(27205);
    expect(
      await screen.findByText(/thief who steals corporate secrets/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to results/i }));

    expect(await screen.findByText("Inception")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MovieSearch onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
