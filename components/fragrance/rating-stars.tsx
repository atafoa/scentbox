"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 1-10 scale
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export function RatingStars({
  rating,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
}: RatingStarsProps) {
  // Convert 1-10 to 0.5-5.0
  const displayRating = rating / 2;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (index: number, isHalf: boolean) => {
    if (!interactive || !onRatingChange) return;
    const newRating = isHalf ? (index + 1) * 2 - 1 : (index + 1) * 2;
    onRatingChange(newRating);
  };

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => {
        const isFull = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <div
            key={index}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => handleClick(index, false)}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground/30"
              )}
            />
            {/* Filled star overlay */}
            {isFull && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 fill-primary text-primary"
                )}
              />
            )}
            {/* Half star overlay */}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-primary text-primary"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface InteractiveRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

export function InteractiveRating({ value, onChange, size = "lg" }: InteractiveRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => {
        const isHalf = starValue % 2 === 1;
        const starIndex = Math.ceil(starValue / 2);
        const isFilled = value >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            className={cn(
              "relative transition-transform hover:scale-110 focus:outline-none",
              isHalf ? "-mr-2" : ""
            )}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-primary text-primary" : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium">
        {(value / 2).toFixed(1)}
      </span>
    </div>
  );
}
