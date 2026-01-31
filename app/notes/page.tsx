import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

async function getNotes() {
  return prisma.note.findMany({
    include: {
      _count: {
        select: { fragrances: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

const categoryColors: Record<string, string> = {
  CITRUS: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  FLORAL: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  WOODY: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  ORIENTAL: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  FRESH: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  SPICY: "bg-red-100 text-red-800 hover:bg-red-200",
  FRUITY: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  GREEN: "bg-green-100 text-green-800 hover:bg-green-200",
  AQUATIC: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  GOURMAND: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  MUSK: "bg-stone-100 text-stone-800 hover:bg-stone-200",
  AMBER: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  LEATHER: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  AROMATIC: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
};

export const metadata = {
  title: "Notes",
  description: "Explore fragrance notes and discover scents by ingredient.",
};

export default async function NotesPage() {
  const notes = await getNotes();

  // Group notes by category
  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const categories = Object.keys(groupedNotes).sort();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fragrance Notes</h1>
        <p className="text-muted-foreground mt-2">
          Discover fragrances by their ingredients
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {category.toLowerCase().replace("_", " ")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {groupedNotes[category].map((note) => (
                <Link key={note.id} href={`/notes/${note.slug}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-colors text-sm py-2 px-4",
                      categoryColors[note.category] || "bg-gray-100 text-gray-800"
                    )}
                  >
                    {note.name}
                    <span className="ml-2 opacity-60">
                      ({note._count.fragrances})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
