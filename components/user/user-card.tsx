import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { getInitials } from "@/lib/utils";

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    bio?: string | null;
    _count?: {
      reviews: number;
      followers: number;
    };
  };
  showFollowButton?: boolean;
  isFollowing?: boolean;
  currentUserId?: string;
}

export function UserCard({
  user,
  showFollowButton = true,
  isFollowing,
  currentUserId,
}: UserCardProps) {
  const isOwnProfile = currentUserId === user.id;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Link href={`/users/${user.username}`}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>
              {getInitials(user.name || user.username || "U")}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/users/${user.username}`}
            className="font-medium hover:underline"
          >
            {user.name || user.username}
          </Link>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user._count && (
            <p className="text-xs text-muted-foreground mt-1">
              {user._count.reviews} reviews · {user._count.followers} followers
            </p>
          )}
        </div>

        {showFollowButton && !isOwnProfile && (
          <FollowButton
            userId={user.id}
            initialIsFollowing={isFollowing}
            showIcon={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
