import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitials, timeAgo } from "@/lib/utils";
import { Heart, MessageSquare, Star, UserPlus, List } from "lucide-react";

async function getFeed(userId: string) {
  // Get IDs of users being followed
  const following = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // Include own activity and following's activity
  const userIds = [userId, ...followingIds];

  return prisma.activity.findMany({
    where: {
      userId: { in: userIds },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      fragrance: {
        include: {
          brand: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          content: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function getSuggestedUsers(userId: string) {
  // Get users who have the most followers, excluding current user and already followed
  const following = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  return prisma.user.findMany({
    where: {
      id: { notIn: [userId, ...followingIds] },
    },
    include: {
      _count: {
        select: { followers: true, reviews: true },
      },
    },
    orderBy: {
      followers: { _count: "desc" },
    },
    take: 5,
  });
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "REVIEWED":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "RATED":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "LIKED_REVIEW":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "FOLLOWED_USER":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "CREATED_LIST":
      return <List className="h-4 w-4 text-purple-500" />;
    case "ADDED_TO_COLLECTION":
      return <Star className="h-4 w-4 text-primary" />;
    default:
      return <Star className="h-4 w-4 text-muted-foreground" />;
  }
}

function ActivityDescription({ activity }: { activity: any }) {
  const { type, user, fragrance, review } = activity;

  switch (type) {
    case "REVIEWED":
      return (
        <>
          <Link href={`/users/${user.username}`} className="font-medium hover:underline">
            {user.name || user.username}
          </Link>
          {" reviewed "}
          <Link href={`/fragrances/${fragrance?.slug}`} className="font-medium text-primary hover:underline">
            {fragrance?.brand.name} {fragrance?.name}
          </Link>
          {review && (
            <span className="text-muted-foreground"> - {(review.rating / 2).toFixed(1)}/5</span>
          )}
        </>
      );
    case "ADDED_TO_COLLECTION":
      return (
        <>
          <Link href={`/users/${user.username}`} className="font-medium hover:underline">
            {user.name || user.username}
          </Link>
          {" added "}
          <Link href={`/fragrances/${fragrance?.slug}`} className="font-medium text-primary hover:underline">
            {fragrance?.brand.name} {fragrance?.name}
          </Link>
          {" to their collection"}
        </>
      );
    case "FOLLOWED_USER":
      return (
        <>
          <Link href={`/users/${user.username}`} className="font-medium hover:underline">
            {user.name || user.username}
          </Link>
          {" followed a user"}
        </>
      );
    case "CREATED_LIST":
      return (
        <>
          <Link href={`/users/${user.username}`} className="font-medium hover:underline">
            {user.name || user.username}
          </Link>
          {" created a new list"}
        </>
      );
    default:
      return (
        <>
          <Link href={`/users/${user.username}`} className="font-medium hover:underline">
            {user.name || user.username}
          </Link>
          {" did something"}
        </>
      );
  }
}

export const metadata = {
  title: "Feed",
  description: "See what your friends are up to in the fragrance world.",
};

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [activities, suggestedUsers] = await Promise.all([
    getFeed(session.user.id),
    getSuggestedUsers(session.user.id),
  ]);

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Your Feed</h1>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/users/${activity.user.username}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activity.user.image || undefined} />
                          <AvatarFallback>
                            {getInitials(activity.user.name || activity.user.username || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <ActivityIcon type={activity.type} />
                          <p className="text-sm">
                            <ActivityDescription activity={activity} />
                          </p>
                        </div>
                        {activity.review?.content && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            "{activity.review.content}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Your feed is empty. Follow some users to see their activity here!
                </p>
                <Button asChild>
                  <Link href="/fragrances">Explore Fragrances</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {suggestedUsers.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Suggested Users</h3>
                <div className="space-y-3">
                  {suggestedUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.username}`}
                      className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md -mx-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name || user.username || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user._count.reviews} reviews
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/fragrances">Browse Fragrances</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/lists">Explore Lists</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href={`/users/${session.user.username}`}>Your Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
