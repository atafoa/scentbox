import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBrand(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      fragrances: {
        include: { brand: true },
        orderBy: [{ averageRating: "desc" }, { name: "asc" }],
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    return { title: "Brand Not Found" };
  }

  return {
    title: brand.name,
    description: brand.description || `Explore fragrances by ${brand.name}`,
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{brand.name}</h1>
        {brand.country && (
          <p className="text-muted-foreground">{brand.country}</p>
        )}
        {brand.description && (
          <p className="mt-4 max-w-3xl">{brand.description}</p>
        )}
        <p className="text-muted-foreground mt-4">
          {brand.fragrances.length} fragrances
        </p>
      </div>

      {brand.fragrances.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brand.fragrances.map((fragrance) => (
            <FragranceCard key={fragrance.id} fragrance={fragrance} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No fragrances found for this brand.
        </p>
      )}
    </div>
  );
}
