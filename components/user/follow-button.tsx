"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  className,
  showIcon = true,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.id === userId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(className)}
    >
      {showIcon && (
        isFollowing ? (
          <UserMinus className="mr-2 h-4 w-4" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
