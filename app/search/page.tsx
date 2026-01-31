import { prisma } from "@/lib/prisma";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { UserCard } from "@/components/user/user-card";
import { auth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchFragrances(query: string) {
  const lowerQuery = query.toLowerCase();
  return prisma.fragrance.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { name: { contains: query } },
        { brand: { name: { contains: lowerQuery } } },
        { brand: { name: { contains: query } } },
        { notes: { some: { note: { name: { contains: lowerQuery } } } } },
        { notes: { some: { note: { name: { contains: query } } } } },
      ],
    },
    include: { brand: true },
    take: 20,
    orderBy: { reviewCount: "desc" },
  });
}

async function searchBrands(query: string) {
  const lowerQuery = query.toLowerCase();
  return prisma.brand.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { name: { contains: query } },
      ],
    },
    include: {
      _count: {
        select: { fragrances: true },
      },
    },
    take: 10,
    orderBy: { name: "asc" },
  });
}

async function searchUsers(query: string) {
  const lowerQuery = query.toLowerCase();
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { name: { contains: query } },
        { username: { contains: lowerQuery } },
        { username: { contains: query } },
      ],
    },
    include: {
      _count: {
        select: { reviews: true, followers: true },
      },
    },
    take: 10,
  });
}

async function searchNotes(query: string) {
  const lowerQuery = query.toLowerCase();
  return prisma.note.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { name: { contains: query } },
      ],
    },
    include: {
      _count: {
        select: { fragrances: true },
      },
    },
    take: 20,
    orderBy: { name: "asc" },
  });
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const session = await auth();

  if (!q) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <p className="text-muted-foreground">
          Enter a search term to find fragrances, brands, notes, or users.
        </p>
      </div>
    );
  }

  const [fragrances, brands, users, notes] = await Promise.all([
    searchFragrances(q),
    searchBrands(q),
    searchUsers(q),
    searchNotes(q),
  ]);

  const totalResults = fragrances.length + brands.length + users.length + notes.length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground mt-2">
          {totalResults} results for &quot;{q}&quot;
        </p>
      </div>

      <Tabs defaultValue="fragrances" className="w-full">
        <TabsList>
          <TabsTrigger value="fragrances">
            Fragrances ({fragrances.length})
          </TabsTrigger>
          <TabsTrigger value="brands">
            Brands ({brands.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fragrances" className="mt-6">
          {fragrances.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {fragrances.map((fragrance) => (
                <FragranceCard key={fragrance.id} fragrance={fragrance} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No fragrances found.</p>
          )}
        </TabsContent>

        <TabsContent value="brands" className="mt-6">
          {brands.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {brand._count.fragrances} fragrances
                      </p>
                      {brand.country && (
                        <p className="text-sm text-muted-foreground">
                          {brand.country}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No brands found.</p>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          {notes.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {notes.map((note) => (
                <Link key={note.id} href={`/notes/${note.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{note.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {note.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {note._count.fragrances} fragrances
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No notes found.</p>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {users.length > 0 ? (
            <div className="space-y-3 max-w-2xl">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={session?.user?.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No users found.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
