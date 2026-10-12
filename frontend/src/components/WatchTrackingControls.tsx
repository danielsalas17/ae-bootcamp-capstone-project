import { useEffect, useState } from "react";
import { getEntry, upsertEntry, type WatchEntry } from "@/lib/api";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface WatchTrackingControlsProps {
  userId: string;
  movieId: number;
}

interface TrackingState {
  watched: boolean;
  rating: number | null;
  notes: string;
}

const DEFAULT_STATE: TrackingState = {
  watched: false,
  rating: null,
  notes: "",
};

function toTrackingState(entry: WatchEntry | null): TrackingState {
  if (!entry) {
    return DEFAULT_STATE;
  }
  return { watched: entry.watched, rating: entry.rating, notes: entry.notes };
}

export function WatchTrackingControls({
  userId,
  movieId,
}: WatchTrackingControlsProps) {
  const [tracking, setTracking] = useState<TrackingState>(DEFAULT_STATE);
  const [reviewDraft, setReviewDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getEntry(userId, movieId)
      .then((entry) => {
        if (!cancelled) {
          const next = toTrackingState(entry);
          setTracking(next);
          setReviewDraft(next.notes);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTracking(DEFAULT_STATE);
          setReviewDraft("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, movieId]);

  async function handleWatchedChange(watched: boolean) {
    setTracking((prev) => ({ ...prev, watched }));
    await upsertEntry(userId, movieId, { watched });
  }

  async function handleRatingChange(rating: number | null) {
    setTracking((prev) => ({ ...prev, rating }));
    await upsertEntry(userId, movieId, { rating });
  }

  async function handleSaveReview() {
    setSavingReview(true);
    try {
      await upsertEntry(userId, movieId, { notes: reviewDraft });
      setTracking((prev) => ({ ...prev, notes: reviewDraft }));
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Loading your tracking...</p>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={tracking.watched}
          onCheckedChange={handleWatchedChange}
        />
        Watched
      </label>

      <StarRating value={tracking.rating} onChange={handleRatingChange} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="review">
          Review
        </label>
        <Textarea
          id="review"
          value={reviewDraft}
          onChange={(event) => setReviewDraft(event.target.value)}
          onBlur={() => {
            if (reviewDraft !== tracking.notes) {
              handleSaveReview();
            }
          }}
          placeholder="Write an optional review..."
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveReview}
          disabled={savingReview || reviewDraft === tracking.notes}
        >
          {savingReview ? "Saving..." : "Save review"}
        </Button>
      </div>
    </div>
  );
}
