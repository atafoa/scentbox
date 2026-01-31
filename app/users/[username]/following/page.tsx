import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserCard } from "@/components/user/user-card";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      following: {
        include: {
          following: {
            include: {
              _count: {
                select: {
                  reviews: true,
                  followers: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function getFollowingIds(userId: string) {
  const following = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return new Set(following.map((f) => f.followingId));
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  return {
    title: `${username}'s Following`,
  };
}

export default async function FollowingPage({ params }: PageProps) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUser(username),
    auth(),
  ]);

  if (!user) {
    notFound();
  }

  let followingIds = new Set<string>();
  if (session?.user?.id) {
    followingIds = await getFollowingIds(session.user.id);
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href={`/users/${username}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to profile
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {user.name || user.username} is Following
      </h1>

      {user.following.length > 0 ? (
        <div className="space-y-3">
          {user.following.map(({ following: followedUser }) => (
            <UserCard
              key={followedUser.id}
              user={followedUser}
              isFollowing={followingIds.has(followedUser.id)}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Not following anyone yet.</p>
        </div>
      )}
    </div>
  );
}
