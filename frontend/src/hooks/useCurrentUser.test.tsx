import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as api from "@/lib/api";
import { CurrentUserProvider, useCurrentUser } from "./useCurrentUser";

const STORAGE_KEY = "letterboxd-clone:userId";

describe("CurrentUserProvider / useCurrentUser", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("restores a valid stored user on load", async () => {
    const user = { id: "user-1", username: "alice", createdAt: "2024-01-01T00:00:00.000Z" };
    localStorage.setItem(STORAGE_KEY, user.id);
    vi.spyOn(api, "getUser").mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(user);
  });

  it("clears an invalid stored user id", async () => {
    localStorage.setItem(STORAGE_KEY, "stale-id");
    vi.spyOn(api, "getUser").mockRejectedValue(new Error("Failed to fetch user: 404"));

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("logs in and persists the user id", async () => {
    const user = { id: "user-2", username: "bob", createdAt: "2024-01-01T00:00:00.000Z" };
    vi.spyOn(api, "createOrGetUser").mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login("bob");
    });

    expect(result.current.user).toEqual(user);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("user-2");
  });

  it("logs out and clears the stored user id", async () => {
    const user = { id: "user-1", username: "alice", createdAt: "2024-01-01T00:00:00.000Z" };
    localStorage.setItem(STORAGE_KEY, user.id);
    vi.spyOn(api, "getUser").mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    await waitFor(() => expect(result.current.user).toEqual(user));

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
