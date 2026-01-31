import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 });
    }

    // Create like and activity
    await prisma.$transaction([
      prisma.reviewLike.create({
        data: {
          userId: session.user.id,
          reviewId,
        },
      }),
      prisma.activity.create({
        data: {
          userId: session.user.id,
          type: "LIKED_REVIEW",
          reviewId,
          fragranceId: review.fragranceId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to like review:", error);
    return NextResponse.json(
      { error: "Failed to like review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;

    await prisma.reviewLike.delete({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unlike review:", error);
    return NextResponse.json(
      { error: "Failed to unlike review" },
      { status: 500 }
    );
  }
}
