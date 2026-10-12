import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createOrGetUser, getUser, type User } from "@/lib/api";

const STORAGE_KEY = "letterboxd-clone:userId";

interface CurrentUserContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    if (!storedUserId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    getUser(storedUserId)
      .then((fetchedUser) => {
        if (!cancelled) {
          setUser(fetchedUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string) => {
    const loggedInUser = await createOrGetUser(username);
    localStorage.setItem(STORAGE_KEY, loggedInUser.id);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <CurrentUserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}
