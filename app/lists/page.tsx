import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, timeAgo } from "@/lib/utils";
import { Plus } from "lucide-react";

async function getPublicLists() {
  return prisma.list.findMany({
    where: { isPublic: true },
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
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

export const metadata = {
  title: "Lists",
  description: "Browse curated fragrance lists from the community.",
};

export default async function ListsPage() {
  const [lists, session] = await Promise.all([
    getPublicLists(),
    auth(),
  ]);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Fragrance Lists</h1>
          <p className="text-muted-foreground mt-2">
            Curated collections from the community
          </p>
        </div>
        {session && (
          <Button asChild>
            <Link href="/lists/new">
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Link>
          </Button>
        )}
      </div>

      {lists.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{list.name}</CardTitle>
                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={list.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(list.user.name || list.user.username || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {list.user.name || list.user.username}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {list._count.items} fragrances
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No lists have been created yet.
          </p>
          {session && (
            <Button asChild>
              <Link href="/lists/new">Create the first list</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
