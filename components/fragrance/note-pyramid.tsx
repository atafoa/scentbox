import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Note {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface FragranceNote {
  note: Note;
  layer: "TOP" | "MIDDLE" | "BASE";
}

interface NotePyramidProps {
  notes: FragranceNote[];
  interactive?: boolean;
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

export function NotePyramid({ notes, interactive = true }: NotePyramidProps) {
  const topNotes = notes.filter((n) => n.layer === "TOP");
  const middleNotes = notes.filter((n) => n.layer === "MIDDLE");
  const baseNotes = notes.filter((n) => n.layer === "BASE");

  const renderNotes = (noteList: FragranceNote[], label: string) => {
    if (noteList.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <div className="flex flex-wrap gap-2">
          {noteList.map(({ note }) => {
            const badgeContent = (
              <Badge
                variant="secondary"
                className={cn(
                  "cursor-pointer transition-colors",
                  categoryColors[note.category] || "bg-gray-100 text-gray-800"
                )}
              >
                {note.name}
              </Badge>
            );

            if (interactive) {
              return (
                <Link key={note.id} href={`/notes/${note.slug}`}>
                  {badgeContent}
                </Link>
              );
            }

            return <span key={note.id}>{badgeContent}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Pyramid visual */}
          <div className="flex flex-col items-center space-y-1">
            <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-200" />
            <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[35px] border-l-transparent border-r-transparent border-b-pink-200 -mt-1" />
            <div className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[40px] border-l-transparent border-r-transparent border-b-amber-200 -mt-1" />
          </div>
          {/* Labels */}
          <div className="absolute -right-16 top-2 text-xs text-muted-foreground">Top</div>
          <div className="absolute -right-20 top-12 text-xs text-muted-foreground">Middle</div>
          <div className="absolute -right-16 top-24 text-xs text-muted-foreground">Base</div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {renderNotes(topNotes, "Top Notes")}
        {renderNotes(middleNotes, "Middle Notes")}
        {renderNotes(baseNotes, "Base Notes")}
      </div>
    </div>
  );
}

export function NotesList({ notes, interactive = true }: NotePyramidProps) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No notes information available.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {notes.map(({ note }) => {
        const badgeContent = (
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer transition-colors",
              categoryColors[note.category] || "bg-gray-100 text-gray-800"
            )}
          >
            {note.name}
          </Badge>
        );

        if (interactive) {
          return (
            <Link key={note.id} href={`/notes/${note.slug}`}>
              {badgeContent}
            </Link>
          );
        }

        return <span key={note.id}>{badgeContent}</span>;
      })}
    </div>
  );
}
