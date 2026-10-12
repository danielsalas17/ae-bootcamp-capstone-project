import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as api from "@/lib/api";

describe("App", () => {
  it("renders the landing heading and search action", () => {
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /letterboxd clone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search movies/i }),
    ).toBeInTheDocument();
  });

  it("reveals the inline search input when the button is clicked, and hides it again on close", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getPopularMovies").mockResolvedValue([]);

    render(<App />);

    await user.click(screen.getByRole("button", { name: /search movies/i }));

    expect(screen.getByLabelText(/search by title/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.queryByLabelText(/search by title/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search movies/i }),
    ).toBeInTheDocument();
  });
});
