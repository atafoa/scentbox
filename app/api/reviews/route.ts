import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Check if fragrance exists
    const fragrance = await prisma.fragrance.findUnique({
      where: { id: validated.fragranceId },
    });

    if (!fragrance) {
      return NextResponse.json({ error: "Fragrance not found" }, { status: 404 });
    }

    // Check if user already has a review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_fragranceId: {
          userId: session.user.id,
          fragranceId: validated.fragranceId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this fragrance" },
        { status: 400 }
      );
    }

    // Create review and update fragrance stats
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId: session.user.id,
          fragranceId: validated.fragranceId,
          rating: validated.rating,
          content: validated.content,
          longevity: validated.longevity,
          sillage: validated.sillage,
          value: validated.value,
          season: validated.season,
        },
      });

      // Update fragrance average rating
      const allReviews = await tx.review.findMany({
        where: { fragranceId: validated.fragranceId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length / 2;

      await tx.fragrance.update({
        where: { id: validated.fragranceId },
        data: {
          averageRating: avgRating,
          reviewCount: allReviews.length,
        },
      });

      // Create activity
      await tx.activity.create({
        data: {
          userId: session.user.id,
          type: "REVIEW",
          fragranceId: validated.fragranceId,
          reviewId: newReview.id,
        },
      });

      return newReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Update review and recalculate stats
    const review = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: {
          userId_fragranceId: {
            userId: session.user.id,
            fragranceId: validated.fragranceId,
          },
        },
        data: {
          rating: validated.rating,
          content: validated.content,
          longevity: validated.longevity,
          sillage: validated.sillage,
          value: validated.value,
          season: validated.season,
        },
      });

      // Update fragrance average rating
      const allReviews = await tx.review.findMany({
        where: { fragranceId: validated.fragranceId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length / 2;

      await tx.fragrance.update({
        where: { id: validated.fragranceId },
        data: {
          averageRating: avgRating,
        },
      });

      return updatedReview;
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
