"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

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

interface FiltersProps {
  brands: Brand[];
  notes: Note[];
  currentFilters: {
    brand?: string;
    gender?: string;
    concentration?: string;
    note?: string;
    sort?: string;
  };
}

const genderOptions = [
  { value: "MASCULINE", label: "For Him" },
  { value: "FEMININE", label: "For Her" },
  { value: "UNISEX", label: "Unisex" },
];

const concentrationOptions = [
  { value: "EAU_FRAICHE", label: "Eau Fraîche" },
  { value: "EAU_DE_COLOGNE", label: "Eau de Cologne" },
  { value: "EAU_DE_TOILETTE", label: "Eau de Toilette" },
  { value: "EAU_DE_PARFUM", label: "Eau de Parfum" },
  { value: "PARFUM", label: "Parfum" },
  { value: "EXTRAIT", label: "Extrait" },
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A-Z" },
];

export function FragranceFilters({ brands, notes, currentFilters }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filters change
    router.push(`/fragrances?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/fragrances");
  };

  const hasFilters =
    currentFilters.brand ||
    currentFilters.gender ||
    currentFilters.concentration ||
    currentFilters.note;

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <div className="space-y-6 sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={currentFilters.sort || "popular"}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select
          value={currentFilters.brand || "all"}
          onValueChange={(value) => updateFilter("brand", value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.slug}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={currentFilters.gender || "all"}
          onValueChange={(value) => updateFilter("gender", value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            {genderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Concentration */}
      <div className="space-y-2">
        <Label>Concentration</Label>
        <Select
          value={currentFilters.concentration || "all"}
          onValueChange={(value) =>
            updateFilter("concentration", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All concentrations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All concentrations</SelectItem>
            {concentrationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label>Note</Label>
        <Select
          value={currentFilters.note || "all"}
          onValueChange={(value) => updateFilter("note", value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All notes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All notes</SelectItem>
            {Object.entries(notesByCategory).map(([category, categoryNotes]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {categoryNotes.map((note) => (
                  <SelectItem key={note.id} value={note.slug}>
                    {note.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
