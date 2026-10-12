import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginScreen } from "./LoginScreen";
import * as useCurrentUserModule from "@/hooks/useCurrentUser";

describe("LoginScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a blank username without calling login", async () => {
    const login = vi.fn();
    vi.spyOn(useCurrentUserModule, "useCurrentUser").mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });
    const user = userEvent.setup();

    render(<LoginScreen />);
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/enter a username/i);
    expect(login).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only username without calling login", async () => {
    const login = vi.fn();
    vi.spyOn(useCurrentUserModule, "useCurrentUser").mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });
    const user = userEvent.setup();

    render(<LoginScreen />);
    await user.type(screen.getByLabelText(/username/i), "   ");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/enter a username/i);
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in with a trimmed, non-blank username", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(useCurrentUserModule, "useCurrentUser").mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });
    const user = userEvent.setup();

    render(<LoginScreen />);
    await user.type(screen.getByLabelText(/username/i), "  alice  ");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(login).toHaveBeenCalledWith("alice");
  });
});
