import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/components/user/profile-header";
import { ReviewCard } from "@/components/review/review-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        include: {
          fragrance: {
            include: { brand: true },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      userFragrances: {
        include: {
          fragrance: {
            include: { brand: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      _count: {
        select: {
          reviews: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

async function isFollowing(currentUserId: string, targetUserId: string) {
  const follow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });
  return !!follow;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || user.username}'s Profile`,
    description: user.bio || `View ${user.name || user.username}'s fragrance collection and reviews.`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUser(username),
    auth(),
  ]);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;
  let following = false;

  if (session?.user?.id && !isOwnProfile) {
    following = await isFollowing(session.user.id, user.id);
  }

  const ownedFragrances = user.userFragrances.filter((uf) => uf.status === "OWN");
  const wantedFragrances = user.userFragrances.filter((uf) => uf.status === "WANT");

  return (
    <div className="container py-8">
      <ProfileHeader
        user={{
          ...user,
          createdAt: user.createdAt.toISOString(),
        }}
        isOwnProfile={isOwnProfile}
        isFollowing={following}
      />

      <div className="mt-8">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">
              Reviews ({user._count.reviews})
            </TabsTrigger>
            <TabsTrigger value="collection">
              Collection ({ownedFragrances.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              Wishlist ({wantedFragrances.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            {user.reviews.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      ...review,
                      createdAt: review.createdAt.toISOString(),
                      user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        image: user.image,
                      },
                    }}
                    showFragrance
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No reviews yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collection" className="mt-6">
            {ownedFragrances.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ownedFragrances.map((uf) => (
                  <FragranceCard
                    key={uf.id}
                    fragrance={uf.fragrance}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fragrances in collection yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="mt-6">
            {wantedFragrances.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {wantedFragrances.map((uf) => (
                  <FragranceCard
                    key={uf.id}
                    fragrance={uf.fragrance}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fragrances in wishlist yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
