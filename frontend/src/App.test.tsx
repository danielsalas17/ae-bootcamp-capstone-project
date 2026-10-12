import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
