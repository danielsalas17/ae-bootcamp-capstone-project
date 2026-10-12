import { MovieDetails } from "@/components/MovieDetails";
import { WatchTrackingControls } from "@/components/WatchTrackingControls";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface MovieDetailsDialogProps {
  movieId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailsDialog({
  movieId,
  open,
  onOpenChange,
}: MovieDetailsDialogProps) {
  const { user } = useCurrentUser();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="sr-only">Movie details</DialogTitle>
        {movieId !== null && (
          <>
            <MovieDetails tmdbId={movieId} />
            {user && (
              <WatchTrackingControls userId={user.id} movieId={movieId} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
