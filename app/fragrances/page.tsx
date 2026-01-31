import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { FragranceFilters } from "./filters";
import { Skeleton } from "@/components/ui/skeleton";

const GENDER_VALUES = ["MASCULINE", "FEMININE", "UNISEX"] as const;
const CONCENTRATION_VALUES = ["EAU_FRAICHE", "EAU_DE_COLOGNE", "EAU_DE_TOILETTE", "EAU_DE_PARFUM", "PARFUM", "EXTRAIT"] as const;

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    gender?: string;
    concentration?: string;
    note?: string;
    sort?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 24;

async function getFragrances(params: {
  brand?: string;
  gender?: string;
  concentration?: string;
  note?: string;
  sort?: string;
  page?: string;
}) {
  const page = parseInt(params.page || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: {
    brand?: { slug: string };
    gender?: string;
    concentration?: string;
    notes?: { some: { note: { slug: string } } };
  } = {};

  if (params.brand) {
    where.brand = { slug: params.brand };
  }
  if (params.gender && GENDER_VALUES.includes(params.gender as typeof GENDER_VALUES[number])) {
    where.gender = params.gender;
  }
  if (params.concentration && CONCENTRATION_VALUES.includes(params.concentration as typeof CONCENTRATION_VALUES[number])) {
    where.concentration = params.concentration;
  }
  if (params.note) {
    where.notes = { some: { note: { slug: params.note } } };
  }

  let orderBy: { averageRating?: "desc"; name?: "asc"; releaseYear?: "desc"; reviewCount?: "desc" } = {};
  switch (params.sort) {
    case "rating":
      orderBy = { averageRating: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { releaseYear: "desc" };
      break;
    case "popular":
    default:
      orderBy = { reviewCount: "desc" };
  }

  const [fragrances, total] = await Promise.all([
    prisma.fragrance.findMany({
      where,
      include: { brand: true },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.fragrance.count({ where }),
  ]);

  return { fragrances, total, page, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

async function getNotes() {
  return prisma.note.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, category: true },
  });
}

export const metadata = {
  title: "Browse Fragrances",
  description: "Discover and explore fragrances from top brands worldwide.",
};

export default async function FragrancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ fragrances, total, page, totalPages }, brands, notes] = await Promise.all([
    getFragrances(params),
    getBrands(),
    getNotes(),
  ]);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Fragrances</h1>
          <p className="text-muted-foreground mt-2">
            Explore {total.toLocaleString()} fragrances from top brands
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <Suspense fallback={<FiltersSkeleton />}>
              <FragranceFilters
                brands={brands}
                notes={notes}
                currentFilters={params}
              />
            </Suspense>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {fragrances.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fragrances.map((fragrance) => (
                    <FragranceCard key={fragrance.id} fragrance={fragrance} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({
                          ...params,
                          page: p.toString(),
                        }).toString()}`}
                        className={`px-3 py-1 rounded ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No fragrances found matching your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
