import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = listSchema.parse(body);

    // Generate unique slug
    let slug = slugify(validated.name);
    let counter = 1;

    while (
      await prisma.list.findUnique({
        where: {
          userId_slug: {
            userId: session.user.id,
            slug,
          },
        },
      })
    ) {
      slug = `${slugify(validated.name)}-${counter}`;
      counter++;
    }

    const list = await prisma.$transaction(async (tx) => {
      const newList = await tx.list.create({
        data: {
          userId: session.user.id,
          name: validated.name,
          slug,
          description: validated.description,
          isPublic: validated.isPublic,
        },
      });

      // Create activity
      await tx.activity.create({
        data: {
          userId: session.user.id,
          type: "CREATED_LIST",
          listId: newList.id,
        },
      });

      return newList;
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error("Failed to create list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
