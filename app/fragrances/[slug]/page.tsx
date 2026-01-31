import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RatingStars } from "@/components/fragrance/rating-stars";
import { NotePyramid } from "@/components/fragrance/note-pyramid";
import { CollectionButton } from "@/components/fragrance/collection-button";
import { ReviewCard } from "@/components/review/review-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const concentrationLabels: Record<string, string> = {
  EAU_FRAICHE: "Eau Fraîche",
  EAU_DE_COLOGNE: "Eau de Cologne",
  EAU_DE_TOILETTE: "Eau de Toilette",
  EAU_DE_PARFUM: "Eau de Parfum",
  PARFUM: "Parfum",
  EXTRAIT: "Extrait",
};

const genderLabels: Record<string, string> = {
  MASCULINE: "For Him",
  FEMININE: "For Her",
  UNISEX: "Unisex",
};

async function getFragrance(slug: string) {
  return prisma.fragrance.findUnique({
    where: { slug },
    include: {
      brand: true,
      notes: {
        include: {
          note: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function getUserCollection(userId: string, fragranceId: string) {
  return prisma.userFragrance.findUnique({
    where: {
      userId_fragranceId: {
        userId,
        fragranceId,
      },
    },
  });
}

async function getUserReviewLikes(userId: string, reviewIds: string[]) {
  const likes = await prisma.reviewLike.findMany({
    where: {
      userId,
      reviewId: { in: reviewIds },
    },
  });
  return new Set(likes.map((l) => l.reviewId));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fragrance = await getFragrance(slug);

  if (!fragrance) {
    return { title: "Fragrance Not Found" };
  }

  return {
    title: `${fragrance.name} by ${fragrance.brand.name}`,
    description:
      fragrance.description ||
      `Discover ${fragrance.name} by ${fragrance.brand.name}. Read reviews, see notes, and add to your collection.`,
  };
}

export default async function FragranceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [fragrance, session] = await Promise.all([
    getFragrance(slug),
    auth(),
  ]);

  if (!fragrance) {
    notFound();
  }

  let userCollection = null;
  let likedReviews = new Set<string>();

  if (session?.user?.id) {
    const [collection, likes] = await Promise.all([
      getUserCollection(session.user.id, fragrance.id),
      getUserReviewLikes(
        session.user.id,
        fragrance.reviews.map((r) => r.id)
      ),
    ]);
    userCollection = collection;
    likedReviews = likes;
  }

  const userReview = fragrance.reviews.find(
    (r) => r.user.id === session?.user?.id
  );

  // Calculate average attribute ratings
  const reviewsWithLongevity = fragrance.reviews.filter((r) => r.longevity);
  const reviewsWithSillage = fragrance.reviews.filter((r) => r.sillage);
  const reviewsWithValue = fragrance.reviews.filter((r) => r.value);

  const avgLongevity =
    reviewsWithLongevity.length > 0
      ? reviewsWithLongevity.reduce((sum, r) => sum + (r.longevity || 0), 0) /
        reviewsWithLongevity.length
      : null;

  const avgSillage =
    reviewsWithSillage.length > 0
      ? reviewsWithSillage.reduce((sum, r) => sum + (r.sillage || 0), 0) /
        reviewsWithSillage.length
      : null;

  const avgValue =
    reviewsWithValue.length > 0
      ? reviewsWithValue.reduce((sum, r) => sum + (r.value || 0), 0) /
        reviewsWithValue.length
      : null;

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Quick Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              {fragrance.image ? (
                <Image
                  src={fragrance.image}
                  alt={fragrance.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  🧴
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <CollectionButton
                fragranceId={fragrance.id}
                initialStatus={userCollection?.status as "WANT" | "TRIED" | "OWN" | undefined}
              />
              {session ? (
                userReview ? (
                  <Button variant="outline" asChild>
                    <Link href={`/fragrances/${slug}/review`}>Edit Review</Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href={`/fragrances/${slug}/review`}>Write a Review</Link>
                  </Button>
                )
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in to Review</Link>
                </Button>
              )}
            </div>

            {/* Attribute Ratings Summary */}
            {(avgLongevity || avgSillage || avgValue) && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Community Ratings</h3>
                {avgLongevity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Longevity</span>
                    <span>{(avgLongevity / 2).toFixed(1)}/5</span>
                  </div>
                )}
                {avgSillage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sillage</span>
                    <span>{(avgSillage / 2).toFixed(1)}/5</span>
                  </div>
                )}
                {avgValue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value</span>
                    <span>{(avgValue / 2).toFixed(1)}/5</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <Link
              href={`/brands/${fragrance.brand.slug}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {fragrance.brand.name}
            </Link>
            <h1 className="text-3xl font-bold mt-1">{fragrance.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              {fragrance.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <RatingStars rating={fragrance.averageRating * 2} size="md" />
                  <span className="font-semibold">
                    {fragrance.averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({fragrance.reviewCount} reviews)
                  </span>
                </div>
              )}
              <Badge variant="secondary">
                {concentrationLabels[fragrance.concentration]}
              </Badge>
              <Badge variant="outline">{genderLabels[fragrance.gender]}</Badge>
              {fragrance.releaseYear && (
                <Badge variant="outline">{fragrance.releaseYear}</Badge>
              )}
            </div>
          </div>

          {fragrance.description && (
            <p className="text-muted-foreground leading-relaxed">
              {fragrance.description}
            </p>
          )}

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({fragrance.reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="mt-6">
              {fragrance.notes.length > 0 ? (
                <NotePyramid notes={fragrance.notes.map(n => ({ ...n, layer: n.layer as "TOP" | "MIDDLE" | "BASE" }))} />
              ) : (
                <p className="text-muted-foreground">
                  No notes information available for this fragrance.
                </p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4">
              {fragrance.reviews.length > 0 ? (
                fragrance.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      ...review,
                      createdAt: review.createdAt.toISOString(),
                      liked: likedReviews.has(review.id),
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                  {session ? (
                    <Button asChild>
                      <Link href={`/fragrances/${slug}/review`}>
                        Write a Review
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/login">Sign in to Review</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
