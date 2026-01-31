import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { getInitials, formatDate } from "@/lib/utils";
import { ChevronLeft, Edit, Lock } from "lucide-react";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getList(id: string) {
  return prisma.list.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      items: {
        include: {
          fragrance: {
            include: { brand: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const list = await getList(id);

  if (!list) {
    return { title: "List Not Found" };
  }

  return {
    title: list.name,
    description: list.description || `A fragrance list by ${list.user.name || list.user.username}`,
  };
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [list, session] = await Promise.all([
    getList(id),
    auth(),
  ]);

  if (!list) {
    notFound();
  }

  // Check if user can view the list
  const isOwner = session?.user?.id === list.userId;
  if (!list.isPublic && !isOwner) {
    notFound();
  }

  return (
    <div className="container py-8">
      <Link
        href="/lists"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Lists
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{list.name}</h1>
            {!list.isPublic && (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {list.description && (
            <p className="text-muted-foreground max-w-2xl">{list.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <Link
              href={`/users/${list.user.username}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={list.user.image || undefined} />
                <AvatarFallback>
                  {getInitials(list.user.name || list.user.username || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {list.user.name || list.user.username}
              </span>
            </Link>
            <span className="text-sm text-muted-foreground">
              {list.items.length} fragrances
            </span>
            <span className="text-sm text-muted-foreground">
              Updated {formatDate(list.updatedAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <Button variant="outline" asChild>
            <Link href={`/lists/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit List
            </Link>
          </Button>
        )}
      </div>

      {list.items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {list.items.map((item, index) => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <FragranceCard fragrance={item.fragrance} />
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            This list doesn&apos;t have any fragrances yet.
          </p>
          {isOwner && (
            <Button asChild className="mt-4">
              <Link href={`/lists/${id}/edit`}>Add fragrances</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
