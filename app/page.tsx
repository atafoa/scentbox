import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { ArrowRight, Star, Users, List } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTrendingFragrances() {
  return prisma.fragrance.findMany({
    take: 8,
    orderBy: [{ reviewCount: "desc" }, { averageRating: "desc" }],
    include: {
      brand: true,
    },
  });
}

async function getRecentReviews() {
  return prisma.review.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
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
    },
  });
}

async function getStats() {
  const [fragranceCount, reviewCount, userCount] = await Promise.all([
    prisma.fragrance.count(),
    prisma.review.count(),
    prisma.user.count(),
  ]);
  return { fragranceCount, reviewCount, userCount };
}

export default async function HomePage() {
  const [trendingFragrances, recentReviews, stats] = await Promise.all([
    getTrendingFragrances(),
    getRecentReviews(),
    getStats(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Discover Your <span className="text-primary">Signature Scent</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Log, rate, and review fragrances. Build your collection, follow fellow
            enthusiasts, and explore the world of perfumery.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/fragrances">
                Browse Fragrances
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50 py-8">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.fragranceCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Fragrances</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.reviewCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.userCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Fragrances */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Trending Fragrances</h2>
              <p className="text-muted-foreground">Most reviewed and highly rated</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/fragrances">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {trendingFragrances.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingFragrances.map((fragrance) => (
                <FragranceCard key={fragrance.id} fragrance={fragrance} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No fragrances yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Why Kunbo?</h2>
            <p className="text-muted-foreground mt-2">
              The ultimate platform for fragrance lovers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 border">
              <Star className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Rate & Review</h3>
              <p className="text-sm text-muted-foreground">
                Share detailed reviews with longevity, sillage, and value ratings.
                Help others discover their perfect scent.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Connect</h3>
              <p className="text-sm text-muted-foreground">
                Follow fellow enthusiasts, see what they&apos;re wearing, and
                discover new fragrances through their collections.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <List className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Curate Lists</h3>
              <p className="text-sm text-muted-foreground">
                Build and share curated lists - summer favorites, office scents,
                date night picks, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      {recentReviews.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Recent Reviews</h2>
                <p className="text-muted-foreground">Fresh perspectives from the community</p>
              </div>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/users/${review.user.username}`}
                        className="font-medium hover:underline"
                      >
                        {review.user.name || review.user.username}
                      </Link>
                      <span className="text-muted-foreground">reviewed</span>
                      <Link
                        href={`/fragrances/${review.fragrance.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.fragrance.brand.name} {review.fragrance.name}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.content}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {(review.rating / 2).toFixed(1)}/5
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
