import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const STAR_INDICES = [1, 2, 3, 4, 5];

function describeStars(value: number) {
  return `${value} star${value === 1 ? "" : "s"}`;
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  function handleSelect(candidate: number) {
    if (disabled) {
      return;
    }
    // Clicking the currently selected value clears the rating.
    onChange(value === candidate ? null : candidate);
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Rating">
      <div className="flex items-center">
        {STAR_INDICES.map((starIndex) => {
          const halfValue = starIndex - 0.5;
          const fillPercent =
            value === null
              ? 0
              : Math.max(0, Math.min(1, value - (starIndex - 1))) * 100;

          return (
            <span key={starIndex} className="relative inline-block h-6 w-6">
              <StarIcon className="absolute inset-0 h-6 w-6 text-muted-foreground" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
                aria-hidden="true"
              >
                <StarIcon className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </span>
              <button
                type="button"
                className={cn(
                  "absolute inset-y-0 left-0 w-1/2",
                  disabled && "cursor-not-allowed",
                )}
                aria-label={`Rate ${describeStars(halfValue)}`}
                onClick={() => handleSelect(halfValue)}
                disabled={disabled}
              />
              <button
                type="button"
                className={cn(
                  "absolute inset-y-0 right-0 w-1/2",
                  disabled && "cursor-not-allowed",
                )}
                aria-label={`Rate ${describeStars(starIndex)}`}
                onClick={() => handleSelect(starIndex)}
                disabled={disabled}
              />
            </span>
          );
        })}
      </div>
      <span className="text-muted-foreground text-sm">
        {value !== null ? `${value} / 5` : "No rating"}
      </span>
    </div>
  );
}
