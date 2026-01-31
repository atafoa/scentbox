"use client";

import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RatingStars } from "@/components/fragrance/rating-stars";
import { getInitials, timeAgo } from "@/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    content: string;
    longevity?: number | null;
    sillage?: number | null;
    value?: number | null;
    season?: string | null;
    createdAt: string | Date;
    user: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
    fragrance?: {
      id: string;
      name: string;
      slug: string;
      brand: {
        name: string;
      };
    };
    _count?: {
      likes: number;
    };
    liked?: boolean;
  };
  showFragrance?: boolean;
  onDelete?: (reviewId: string) => void;
}

const seasonLabels: Record<string, string> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
  WINTER: "Winter",
  ALL_SEASONS: "All Seasons",
};

export function ReviewCard({ review, showFragrance = false, onDelete }: ReviewCardProps) {
  const [liked, setLiked] = useState(review.liked || false);
  const [likeCount, setLikeCount] = useState(review._count?.likes || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleLike = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/like`, {
        method: liked ? "DELETE" : "POST",
      });

      if (res.ok) {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = session?.user?.id === review.user.id;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Link href={`/users/${review.user.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback>
                {getInitials(review.user.name || review.user.username || "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/users/${review.user.username}`}
              className="font-medium hover:underline"
            >
              {review.user.name || review.user.username}
            </Link>
            <p className="text-sm text-muted-foreground">
              @{review.user.username} · {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" />
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/fragrances/${review.fragrance?.slug}/review`}>
                    Edit review
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete?.(review.id)}
                >
                  Delete review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showFragrance && review.fragrance && (
          <Link
            href={`/fragrances/${review.fragrance.slug}`}
            className="block text-sm font-medium text-primary hover:underline"
          >
            {review.fragrance.brand.name} - {review.fragrance.name}
          </Link>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>

        {/* Attribute ratings */}
        {(review.longevity || review.sillage || review.value || review.season) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t">
            {review.longevity && (
              <div>
                <span className="font-medium">Longevity:</span>{" "}
                {(review.longevity / 2).toFixed(1)}/5
              </div>
            )}
            {review.sillage && (
              <div>
                <span className="font-medium">Sillage:</span>{" "}
                {(review.sillage / 2).toFixed(1)}/5
              </div>
            )}
            {review.value && (
              <div>
                <span className="font-medium">Value:</span>{" "}
                {(review.value / 2).toFixed(1)}/5
              </div>
            )}
            {review.season && (
              <div>
                <span className="font-medium">Season:</span>{" "}
                {seasonLabels[review.season]}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleLike}
            disabled={isLoading || !session}
          >
            <Heart
              className={`mr-1 h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            {likeCount > 0 && <span>{likeCount}</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
