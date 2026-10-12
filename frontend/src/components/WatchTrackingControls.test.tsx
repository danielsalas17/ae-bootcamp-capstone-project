import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WatchTrackingControls } from "./WatchTrackingControls";
import * as api from "@/lib/api";

const BASE_ENTRY = {
  id: "entry-1",
  userId: "user-1",
  imdbId: "27205",
  watched: false,
  rating: null,
  notes: "",
  watchlist: false,
  favorite: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("WatchTrackingControls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to unwatched, no rating, and an empty review when there is no existing entry", async () => {
    vi.spyOn(api, "getEntry").mockResolvedValue(null);

    render(<WatchTrackingControls userId="user-1" movieId={27205} />);

    expect(await screen.findByLabelText(/watched/i)).not.toBeChecked();
    expect(screen.getByText(/no rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/review/i)).toHaveValue("");
  });

  it("pre-fills existing watched mark, rating, and review", async () => {
    vi.spyOn(api, "getEntry").mockResolvedValue({
      ...BASE_ENTRY,
      watched: true,
      rating: 3.5,
      notes: "Loved it",
    });

    render(<WatchTrackingControls userId="user-1" movieId={27205} />);

    expect(await screen.findByLabelText(/watched/i)).toBeChecked();
    expect(screen.getByText("3.5 / 5")).toBeInTheDocument();
    expect(screen.getByLabelText(/review/i)).toHaveValue("Loved it");
  });

  it("saves the watched toggle immediately via upsertEntry", async () => {
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
    const upsertSpy = vi.spyOn(api, "upsertEntry").mockResolvedValue({
      ...BASE_ENTRY,
      watched: true,
    });
    const user = userEvent.setup();

    render(<WatchTrackingControls userId="user-1" movieId={27205} />);
    await user.click(await screen.findByLabelText(/watched/i));

    expect(upsertSpy).toHaveBeenCalledWith("user-1", 27205, { watched: true });
  });

  it("saves a rating change immediately via upsertEntry", async () => {
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
    const upsertSpy = vi.spyOn(api, "upsertEntry").mockResolvedValue({
      ...BASE_ENTRY,
      rating: 4,
    });
    const user = userEvent.setup();

    render(<WatchTrackingControls userId="user-1" movieId={27205} />);
    await user.click(
      await screen.findByRole("button", { name: "Rate 4 stars" }),
    );

    expect(upsertSpy).toHaveBeenCalledWith("user-1", 27205, { rating: 4 });
  });

  it("does not save the review on every keystroke, only on the explicit save action", async () => {
    vi.spyOn(api, "getEntry").mockResolvedValue(null);
    const upsertSpy = vi.spyOn(api, "upsertEntry").mockResolvedValue({
      ...BASE_ENTRY,
      notes: "Great movie",
    });
    const user = userEvent.setup();

    render(<WatchTrackingControls userId="user-1" movieId={27205} />);
    const reviewField = await screen.findByLabelText(/review/i);
    await user.type(reviewField, "Great movie");

    expect(upsertSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /save review/i }));

    await waitFor(() =>
      expect(upsertSpy).toHaveBeenCalledWith("user-1", 27205, {
        notes: "Great movie",
      }),
    );
    expect(upsertSpy).toHaveBeenCalledTimes(1);
  });
});
