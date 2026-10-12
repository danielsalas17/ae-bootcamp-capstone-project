import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as api from "@/lib/api";

const CURRENT_USER = { id: "user-1", username: "alice", createdAt: "2024-01-01T00:00:00.000Z" };

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the login screen when there is no current user", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /welcome/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /letterboxd clone/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the landing heading and search action for a logged-in user", async () => {
    localStorage.setItem("letterboxd-clone:userId", CURRENT_USER.id);
    vi.spyOn(api, "getUser").mockResolvedValue(CURRENT_USER);
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([]);

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /letterboxd clone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search movies/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it("reveals the inline search input when the button is clicked, and hides it again on close", async () => {
    localStorage.setItem("letterboxd-clone:userId", CURRENT_USER.id);
    vi.spyOn(api, "getUser").mockResolvedValue(CURRENT_USER);
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);
    vi.spyOn(api, "listEntriesForUser").mockResolvedValue([]);
    const user = userEvent.setup();

    render(<App />);
    await screen.findByRole("heading", { name: /letterboxd clone/i });

    await user.click(screen.getByRole("button", { name: /search movies/i }));

    expect(screen.getByLabelText(/search by title/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.queryByLabelText(/search by title/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search movies/i }),
    ).toBeInTheDocument();
  });
});

