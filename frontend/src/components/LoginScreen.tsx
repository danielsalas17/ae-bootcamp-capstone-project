import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function LoginScreen() {
  const { login } = useCurrentUser();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(trimmed);
    } catch {
      setError("Something went wrong logging in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bg-card ring-border/60 flex w-full max-w-sm flex-col gap-4 rounded-xl p-6 text-center shadow-sm ring-1"
      aria-label="Log in"
    >
      <h1 className="text-4xl font-semibold tracking-tight">Welcome</h1>
      <p className="text-muted-foreground text-sm">
        Enter a username to start tracking movies. No password needed.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          autoFocus
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-label="Username"
        />
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Continue"}
        </Button>
      </form>
    </section>
  );
}
