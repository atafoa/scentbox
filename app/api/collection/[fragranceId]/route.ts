import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userFragranceSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ fragranceId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fragranceId } = await params;
    const body = await request.json();

    const validated = userFragranceSchema.parse({
      fragranceId,
      ...body,
    });

    // Check if fragrance exists
    const fragrance = await prisma.fragrance.findUnique({
      where: { id: fragranceId },
    });

    if (!fragrance) {
      return NextResponse.json({ error: "Fragrance not found" }, { status: 404 });
    }

    // Upsert user fragrance
    const userFragrance = await prisma.userFragrance.upsert({
      where: {
        userId_fragranceId: {
          userId: session.user.id,
          fragranceId,
        },
      },
      update: {
        status: validated.status,
        rating: validated.rating,
        notes: validated.notes,
      },
      create: {
        userId: session.user.id,
        fragranceId,
        status: validated.status,
        rating: validated.rating,
        notes: validated.notes,
      },
    });

    // Create activity for new additions
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "ADDED_TO_COLLECTION",
        fragranceId,
      },
    });

    return NextResponse.json(userFragrance);
  } catch (error) {
    console.error("Failed to update collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
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

    const { fragranceId } = await params;

    await prisma.userFragrance.delete({
      where: {
        userId_fragranceId: {
          userId: session.user.id,
          fragranceId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove from collection" },
      { status: 500 }
    );
  }
}
