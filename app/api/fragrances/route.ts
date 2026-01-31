import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fragranceSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = fragranceSchema.parse(body);

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: validated.brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Generate unique slug from name + brand
    let baseSlug = slugify(`${validated.name}-${brand.name}`);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.fragrance.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create fragrance in transaction with notes
    const fragrance = await prisma.$transaction(async (tx) => {
      const newFragrance = await tx.fragrance.create({
        data: {
          name: validated.name,
          slug,
          brandId: validated.brandId,
          concentration: validated.concentration,
          gender: validated.gender,
          releaseYear: validated.releaseYear,
          description: validated.description || null,
          image: validated.image || null,
        },
      });

      // Create fragrance notes if provided
      if (validated.notes && validated.notes.length > 0) {
        await tx.fragranceNote.createMany({
          data: validated.notes.map((note) => ({
            fragranceId: newFragrance.id,
            noteId: note.noteId,
            layer: note.layer,
          })),
        });
      }

      // Create activity for the creator
      await tx.activity.create({
        data: {
          userId: session.user.id,
          type: "ADD_FRAGRANCE",
          fragranceId: newFragrance.id,
        },
      });

      return newFragrance;
    });

    return NextResponse.json(fragrance, { status: 201 });
  } catch (error) {
    console.error("Failed to create fragrance:", error);
    return NextResponse.json(
      { error: "Failed to create fragrance" },
      { status: 500 }
    );
  }
}
