import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, formatDate } from "@/lib/utils";
import { FollowButton } from "./follow-button";
import { CalendarDays, MapPin } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
    createdAt: string | Date;
    _count: {
      reviews: number;
      followers: number;
      following: number;
    };
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
}

export function ProfileHeader({ user, isOwnProfile, isFollowing }: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="text-2xl">
            {getInitials(user.name || user.username || "U")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
            {isOwnProfile ? (
              <Button variant="outline" asChild className="md:ml-auto">
                <Link href="/settings">Edit Profile</Link>
              </Button>
            ) : (
              <FollowButton
                userId={user.id}
                initialIsFollowing={isFollowing}
                className="md:ml-auto"
              />
            )}
          </div>

          {user.bio && (
            <p className="text-sm max-w-lg">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 border-t pt-4">
        <Link href={`/users/${user.username}`} className="text-center hover:underline">
          <div className="text-xl font-bold">{user._count.reviews}</div>
          <div className="text-sm text-muted-foreground">Reviews</div>
        </Link>
        <Link href={`/users/${user.username}/followers`} className="text-center hover:underline">
          <div className="text-xl font-bold">{user._count.followers}</div>
          <div className="text-sm text-muted-foreground">Followers</div>
        </Link>
        <Link href={`/users/${user.username}/following`} className="text-center hover:underline">
          <div className="text-xl font-bold">{user._count.following}</div>
          <div className="text-sm text-muted-foreground">Following</div>
        </Link>
      </div>
    </div>
  );
}
