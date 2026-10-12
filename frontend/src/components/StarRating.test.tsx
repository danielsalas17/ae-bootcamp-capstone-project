import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("displays the current value", () => {
    render(<StarRating value={3.5} onChange={vi.fn()} />);

    expect(screen.getByText("3.5 / 5")).toBeInTheDocument();
  });

  it("shows 'No rating' when the value is null", () => {
    render(<StarRating value={null} onChange={vi.fn()} />);

    expect(screen.getByText(/no rating/i)).toBeInTheDocument();
  });

  it("selects a half-star value when the left half of a star is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={null} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Rate 3.5 stars" }));

    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it("selects a whole-star value when the right half of a star is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={null} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("clears the rating when the currently selected value is clicked again", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={4} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("supports keyboard activation via Enter", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={null} onChange={onChange} />);
    screen.getByRole("button", { name: "Rate 2.5 stars" }).focus();
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StarRating value={null} onChange={onChange} disabled />);
    await user.click(screen.getByRole("button", { name: "Rate 1 star" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
