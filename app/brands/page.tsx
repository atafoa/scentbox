import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

async function getBrands() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: { fragrances: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export const metadata = {
  title: "Brands",
  description: "Browse fragrance brands from around the world.",
};

export default async function BrandsPage() {
  const brands = await getBrands();

  // Group brands by first letter
  const groupedBrands = brands.reduce((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(brand);
    return acc;
  }, {} as Record<string, typeof brands>);

  const letters = Object.keys(groupedBrands).sort();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground mt-2">
          Explore {brands.length} fragrance houses
        </p>
      </div>

      {/* Letter Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className="px-3 py-1 rounded bg-muted hover:bg-muted/80 text-sm font-medium"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Brand List */}
      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={letter}>
            <h2 className="text-xl font-bold mb-4 sticky top-16 bg-background py-2 border-b">
              {letter}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedBrands[letter].map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{brand.name}</h3>
                      {brand.country && (
                        <p className="text-sm text-muted-foreground">
                          {brand.country}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {brand._count.fragrances} fragrances
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
