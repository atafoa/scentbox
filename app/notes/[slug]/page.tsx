import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FragranceCard } from "@/components/fragrance/fragrance-card";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getNote(slug: string) {
  return prisma.note.findUnique({
    where: { slug },
    include: {
      fragrances: {
        include: {
          fragrance: {
            include: { brand: true },
          },
        },
      },
    },
  });
}

const categoryColors: Record<string, string> = {
  CITRUS: "bg-yellow-100 text-yellow-800",
  FLORAL: "bg-pink-100 text-pink-800",
  WOODY: "bg-amber-100 text-amber-800",
  ORIENTAL: "bg-orange-100 text-orange-800",
  FRESH: "bg-cyan-100 text-cyan-800",
  SPICY: "bg-red-100 text-red-800",
  FRUITY: "bg-purple-100 text-purple-800",
  GREEN: "bg-green-100 text-green-800",
  AQUATIC: "bg-blue-100 text-blue-800",
  GOURMAND: "bg-rose-100 text-rose-800",
  MUSK: "bg-stone-100 text-stone-800",
  AMBER: "bg-amber-100 text-amber-800",
  LEATHER: "bg-neutral-100 text-neutral-800",
  AROMATIC: "bg-emerald-100 text-emerald-800",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    return { title: "Note Not Found" };
  }

  return {
    title: `${note.name} Note`,
    description:
      note.description || `Explore fragrances featuring ${note.name}`,
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    notFound();
  }

  // Group fragrances by note layer
  const topFragrances = note.fragrances.filter((f) => f.layer === "TOP");
  const middleFragrances = note.fragrances.filter((f) => f.layer === "MIDDLE");
  const baseFragrances = note.fragrances.filter((f) => f.layer === "BASE");

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{note.name}</h1>
          <Badge
            variant="secondary"
            className={categoryColors[note.category] || "bg-gray-100"}
          >
            {note.category}
          </Badge>
        </div>
        {note.description && (
          <p className="text-muted-foreground max-w-3xl">{note.description}</p>
        )}
        <p className="text-muted-foreground mt-4">
          Found in {note.fragrances.length} fragrances
        </p>
      </div>

      <div className="space-y-8">
        {topFragrances.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">As a Top Note</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {topFragrances.map((f) => (
                <FragranceCard key={f.fragrance.id} fragrance={f.fragrance} />
              ))}
            </div>
          </div>
        )}

        {middleFragrances.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">As a Middle Note</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {middleFragrances.map((f) => (
                <FragranceCard key={f.fragrance.id} fragrance={f.fragrance} />
              ))}
            </div>
          </div>
        )}

        {baseFragrances.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">As a Base Note</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {baseFragrances.map((f) => (
                <FragranceCard key={f.fragrance.id} fragrance={f.fragrance} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
