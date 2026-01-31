import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, Eye, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ status?: string }>;
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  });
}

async function getCollection(userId: string) {
  const collection = await prisma.userFragrance.findMany({
    where: { userId },
    include: {
      fragrance: {
        include: { brand: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by status
  const owned = collection.filter((uf) => uf.status === "OWN");
  const tried = collection.filter((uf) => uf.status === "TRIED");
  const wanted = collection.filter((uf) => uf.status === "WANT");

  // Calculate stats
  const stats = {
    total: collection.length,
    owned: owned.length,
    tried: tried.length,
    wanted: wanted.length,
    uniqueBrands: new Set(collection.map((uf) => uf.fragrance.brandId)).size,
  };

  return { owned, tried, wanted, stats };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || user.username}'s Collection`,
    description: `View ${user.name || user.username}'s fragrance collection on Kunbo.`,
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { status: activeStatus } = await searchParams;

  const [user, session] = await Promise.all([
    getUser(username),
    auth(),
  ]);

  if (!user) {
    notFound();
  }

  const { owned, tried, wanted, stats } = await getCollection(user.id);
  const isOwnProfile = session?.user?.id === user.id;

  const defaultTab = activeStatus || "owned";

  return (
    <div className="container py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href={`/users/${username}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to profile
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isOwnProfile ? "My Collection" : `${user.name || user.username}'s Collection`}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.owned}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Owned</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.tried}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Tried</div>
        </div>
        <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-600">{stats.wanted}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Wishlist</div>
        </div>
      </div>

      {/* Collection Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="owned" className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="hidden sm:inline">Owned</span>
            <Badge variant="secondary" className="ml-1">{stats.owned}</Badge>
          </TabsTrigger>
          <TabsTrigger value="tried" className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Tried</span>
            <Badge variant="secondary" className="ml-1">{stats.tried}</Badge>
          </TabsTrigger>
          <TabsTrigger value="wanted" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="hidden sm:inline">Wishlist</span>
            <Badge variant="secondary" className="ml-1">{stats.wanted}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned">
          {owned.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {owned.map((uf) => (
                <FragranceCard
                  key={uf.id}
                  fragrance={uf.fragrance}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Check className="h-12 w-12 text-green-300" />}
              title="No fragrances owned yet"
              description={isOwnProfile
                ? "Start adding fragrances you own to your collection."
                : `${user.name || user.username} hasn't added any owned fragrances yet.`
              }
            />
          )}
        </TabsContent>

        <TabsContent value="tried">
          {tried.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {tried.map((uf) => (
                <FragranceCard
                  key={uf.id}
                  fragrance={uf.fragrance}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Eye className="h-12 w-12 text-blue-300" />}
              title="No fragrances tried yet"
              description={isOwnProfile
                ? "Mark fragrances you've sampled or tested."
                : `${user.name || user.username} hasn't marked any tried fragrances yet.`
              }
            />
          )}
        </TabsContent>

        <TabsContent value="wanted">
          {wanted.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {wanted.map((uf) => (
                <FragranceCard
                  key={uf.id}
                  fragrance={uf.fragrance}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Heart className="h-12 w-12 text-pink-300" />}
              title="Wishlist is empty"
              description={isOwnProfile
                ? "Add fragrances you want to try or own."
                : `${user.name || user.username} hasn't added any fragrances to their wishlist yet.`
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">{description}</p>
    </div>
  );
}
