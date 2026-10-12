import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function CurrentUserBadge() {
  const { user, logout } = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Logged in as {user.username}</span>
      <Button type="button" variant="ghost" onClick={logout}>
        Switch user
      </Button>
    </div>
  );
}
