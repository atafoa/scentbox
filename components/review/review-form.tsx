"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RatingStars } from "@/components/fragrance/rating-stars";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  fragranceId: string;
  fragranceSlug: string;
  initialData?: {
    rating: number;
    content: string;
    longevity?: number | null;
    sillage?: number | null;
    value?: number | null;
    season?: string | null;
  };
  isEdit?: boolean;
}

export function ReviewForm({
  fragranceId,
  fragranceSlug,
  initialData,
  isEdit = false,
}: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(initialData?.rating || 0);
  const [content, setContent] = useState(initialData?.content || "");
  const [longevity, setLongevity] = useState(initialData?.longevity || 0);
  const [sillage, setSillage] = useState(initialData?.sillage || 0);
  const [value, setValue] = useState(initialData?.value || 0);
  const [season, setSeason] = useState(initialData?.season || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (content.length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/reviews`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fragranceId,
          rating,
          content,
          longevity: longevity || undefined,
          sillage: sillage || undefined,
          value: value || undefined,
          season: season || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save review");
      }

      router.push(`/fragrances/${fragranceSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Overall Rating */}
      <div className="space-y-2">
        <Label className="text-base">Your Rating *</Label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-base">
          Your Review *
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts on this fragrance..."
          className="min-h-[150px]"
          required
          minLength={10}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 10 characters. {content.length}/5000
        </p>
      </div>

      {/* Attribute Ratings */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-sm">Longevity</Label>
          <StarRatingInput value={longevity} onChange={setLongevity} size="sm" />
          <p className="text-xs text-muted-foreground">How long does it last?</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Sillage</Label>
          <StarRatingInput value={sillage} onChange={setSillage} size="sm" />
          <p className="text-xs text-muted-foreground">How far does it project?</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Value</Label>
          <StarRatingInput value={value} onChange={setValue} size="sm" />
          <p className="text-xs text-muted-foreground">Worth the price?</p>
        </div>
      </div>

      {/* Season */}
      <div className="space-y-2">
        <Label htmlFor="season" className="text-sm">
          Best Season
        </Label>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SPRING">Spring</SelectItem>
            <SelectItem value="SUMMER">Summer</SelectItem>
            <SelectItem value="FALL">Fall</SelectItem>
            <SelectItem value="WINTER">Winter</SelectItem>
            <SelectItem value="ALL_SEASONS">All Seasons</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update Review" : "Post Review"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

function StarRatingInput({ value, onChange, size = "lg" }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {[2, 4, 6, 8, 10].map((starValue) => {
        const filled = displayValue >= starValue;
        const halfFilled = displayValue === starValue - 1;

        return (
          <button
            key={starValue}
            type="button"
            className="relative focus:outline-none"
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled
                  ? "fill-primary text-primary"
                  : halfFilled
                  ? "fill-primary/50 text-primary"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {value > 0 ? (value / 2).toFixed(1) : "—"}
      </span>
    </div>
  );
}
