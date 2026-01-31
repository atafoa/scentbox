import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ReviewForm } from "@/components/review/review-form";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getFragrance(slug: string) {
  return prisma.fragrance.findUnique({
    where: { slug },
    include: {
      brand: true,
    },
  });
}

async function getUserReview(userId: string, fragranceId: string) {
  return prisma.review.findUnique({
    where: {
      userId_fragranceId: {
        userId,
        fragranceId,
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const fragrance = await getFragrance(slug);

  if (!fragrance) {
    return { title: "Fragrance Not Found" };
  }

  return {
    title: `Review ${fragrance.name} by ${fragrance.brand.name}`,
  };
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/fragrances/${slug}/review`);
  }

  const fragrance = await getFragrance(slug);

  if (!fragrance) {
    notFound();
  }

  const existingReview = await getUserReview(session.user.id, fragrance.id);

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href={`/fragrances/${slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to {fragrance.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {fragrance.brand.name} - {fragrance.name}
        </p>
      </div>

      <ReviewForm
        fragranceId={fragrance.id}
        fragranceSlug={slug}
        initialData={
          existingReview
            ? {
                rating: existingReview.rating,
                content: existingReview.content,
                longevity: existingReview.longevity,
                sillage: existingReview.sillage,
                value: existingReview.value,
                season: existingReview.season,
              }
            : undefined
        }
        isEdit={!!existingReview}
      />
    </div>
  );
}
