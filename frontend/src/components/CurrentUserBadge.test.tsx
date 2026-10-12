import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrentUserBadge } from "./CurrentUserBadge";
import * as useCurrentUserModule from "@/hooks/useCurrentUser";

describe("CurrentUserBadge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when there is no current user", () => {
    vi.spyOn(useCurrentUserModule, "useCurrentUser").mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<CurrentUserBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the username and logs out when the switch user control is clicked", async () => {
    const logout = vi.fn();
    vi.spyOn(useCurrentUserModule, "useCurrentUser").mockReturnValue({
      user: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      isLoading: false,
      login: vi.fn(),
      logout,
    });
    const user = userEvent.setup();

    render(<CurrentUserBadge />);

    expect(screen.getByText(/alice/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /switch user/i }));

    expect(logout).toHaveBeenCalled();
  });
});
