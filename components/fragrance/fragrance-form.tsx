"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Note {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface FragranceFormProps {
  brands: Brand[];
  notes: Note[];
}

interface SelectedNote {
  noteId: string;
  layer: "TOP" | "MIDDLE" | "BASE";
}

const concentrationOptions = [
  { value: "EAU_FRAICHE", label: "Eau Fraîche" },
  { value: "EAU_DE_COLOGNE", label: "Eau de Cologne" },
  { value: "EAU_DE_TOILETTE", label: "Eau de Toilette" },
  { value: "EAU_DE_PARFUM", label: "Eau de Parfum" },
  { value: "PARFUM", label: "Parfum" },
  { value: "EXTRAIT", label: "Extrait" },
];

const genderOptions = [
  { value: "MASCULINE", label: "For Him" },
  { value: "FEMININE", label: "For Her" },
  { value: "UNISEX", label: "Unisex" },
];

export function FragranceForm({ brands, notes }: FragranceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [concentration, setConcentration] = useState("EAU_DE_PARFUM");
  const [gender, setGender] = useState("UNISEX");
  const [releaseYear, setReleaseYear] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<SelectedNote[]>([]);

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const handleAddNote = (noteId: string, layer: "TOP" | "MIDDLE" | "BASE") => {
    if (selectedNotes.find((n) => n.noteId === noteId)) {
      return;
    }
    setSelectedNotes([...selectedNotes, { noteId, layer }]);
  };

  const handleRemoveNote = (noteId: string) => {
    setSelectedNotes(selectedNotes.filter((n) => n.noteId !== noteId));
  };

  const handleChangeNoteLayer = (noteId: string, layer: "TOP" | "MIDDLE" | "BASE") => {
    setSelectedNotes(
      selectedNotes.map((n) =>
        n.noteId === noteId ? { ...n, layer } : n
      )
    );
  };

  const getNoteById = (noteId: string) => notes.find((n) => n.id === noteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a fragrance name");
      return;
    }

    if (!brandName.trim()) {
      setError("Please enter a brand name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find matching brand ID if user selected an existing brand
      const matchedBrand = brands.find(
        (b) => b.name.toLowerCase() === brandName.trim().toLowerCase()
      );

      const res = await fetch("/api/fragrances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brandId: matchedBrand?.id,
          brandName: brandName.trim(),
          concentration,
          gender,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
          description: description.trim() || undefined,
          image: image.trim() || undefined,
          notes: selectedNotes.length > 0 ? selectedNotes : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create fragrance");
      }

      const fragrance = await res.json();
      router.push(`/fragrances/${fragrance.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const topNotes = selectedNotes.filter((n) => n.layer === "TOP");
  const middleNotes = selectedNotes.filter((n) => n.layer === "MIDDLE");
  const baseNotes = selectedNotes.filter((n) => n.layer === "BASE");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Fragrance Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sauvage"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-base">
              Brand *
            </Label>
            <Input
              id="brand"
              list="brand-suggestions"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., Dior or enter a new brand"
              required
              maxLength={100}
            />
            <datalist id="brand-suggestions">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Select an existing brand or type a new one
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concentration" className="text-base">
              Concentration *
            </Label>
            <Select value={concentration} onValueChange={setConcentration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {concentrationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Gender *</Label>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
              {genderOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center justify-center gap-2 cursor-pointer rounded-md border px-3 py-2 transition-colors text-center",
                    gender === option.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={gender === option.value}
                    onChange={(e) => setGender(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseYear" className="text-base">
              Release Year
            </Label>
            <Input
              id="releaseYear"
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="e.g., 2018"
              min={1900}
              max={2030}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this fragrance..."
              className="min-h-[120px]"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/5000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-base">
              Image URL
            </Label>
            <Input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Right Column - Notes */}
        <div className="space-y-6">
          <div>
            <Label className="text-base">Fragrance Notes</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Select notes and assign them to layers
            </p>
          </div>

          {/* Note Pyramid Preview */}
          {selectedNotes.length > 0 && (
            <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-muted/30">
              <h3 className="font-medium text-sm">Note Pyramid Preview</h3>

              {topNotes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Top Notes
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {topNotes.map((n) => {
                      const note = getNoteById(n.noteId);
                      return note ? (
                        <Badge
                          key={n.noteId}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          {note.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveNote(n.noteId)}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {middleNotes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Heart Notes
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {middleNotes.map((n) => {
                      const note = getNoteById(n.noteId);
                      return note ? (
                        <Badge
                          key={n.noteId}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          {note.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveNote(n.noteId)}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {baseNotes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Base Notes
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {baseNotes.map((n) => {
                      const note = getNoteById(n.noteId);
                      return note ? (
                        <Badge
                          key={n.noteId}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          {note.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveNote(n.noteId)}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note Selection */}
          <div className="border rounded-lg p-3 sm:p-4 space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {Object.entries(notesByCategory).map(([category, categoryNotes]) => (
              <div key={category} className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {category}
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {categoryNotes.map((note) => {
                    const isSelected = selectedNotes.find(
                      (n) => n.noteId === note.id
                    );
                    return (
                      <div key={note.id} className="relative">
                        {isSelected ? (
                          <div className="flex items-center gap-1 bg-primary/10 rounded-md p-1 pr-1.5">
                            <Badge variant="default" className="text-xs sm:text-sm">
                              {note.name}
                            </Badge>
                            <Select
                              value={isSelected.layer}
                              onValueChange={(layer: "TOP" | "MIDDLE" | "BASE") =>
                                handleChangeNoteLayer(note.id, layer)
                              }
                            >
                              <SelectTrigger className="h-6 w-16 sm:w-20 text-xs border-0 bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TOP">Top</SelectItem>
                                <SelectItem value="MIDDLE">Heart</SelectItem>
                                <SelectItem value="BASE">Base</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote(note.id)}
                              className="text-muted-foreground hover:text-destructive p-0.5"
                            >
                              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddNote(note.id, "TOP")}
                            className="text-xs sm:text-sm px-2 py-1 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors active:bg-primary/10"
                          >
                            {note.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-background py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          size="lg"
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? "Creating..." : "Create Fragrance"}
        </Button>
      </div>
    </form>
  );
}
