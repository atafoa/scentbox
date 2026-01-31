import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./rating-stars";
import { cn } from "@/lib/utils";

interface FragranceCardProps {
  fragrance: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    concentration: string;
    gender: string;
    averageRating: number;
    reviewCount: number;
    brand: {
      name: string;
      slug: string;
    };
  };
  variant?: "default" | "compact";
}

const concentrationLabels: Record<string, string> = {
  EAU_FRAICHE: "Eau Fraîche",
  EAU_DE_COLOGNE: "Eau de Cologne",
  EAU_DE_TOILETTE: "Eau de Toilette",
  EAU_DE_PARFUM: "Eau de Parfum",
  PARFUM: "Parfum",
  EXTRAIT: "Extrait",
};

const genderLabels: Record<string, string> = {
  MASCULINE: "For Him",
  FEMININE: "For Her",
  UNISEX: "Unisex",
};

export function FragranceCard({ fragrance, variant = "default" }: FragranceCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/fragrances/${fragrance.slug}`}>
        <Card className="group overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {fragrance.image ? (
                <Image
                  src={fragrance.image}
                  alt={fragrance.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium group-hover:text-primary transition-colors">
                {fragrance.name}
              </p>
              <p className="text-sm text-muted-foreground">{fragrance.brand.name}</p>
            </div>
            {fragrance.averageRating > 0 && (
              <RatingStars rating={fragrance.averageRating * 2} size="sm" />
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/fragrances/${fragrance.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {fragrance.image ? (
            <Image
              src={fragrance.image}
              alt={fragrance.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-4xl">🧴</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {genderLabels[fragrance.gender]}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{fragrance.brand.name}</p>
          <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-1">
            {fragrance.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {concentrationLabels[fragrance.concentration]}
          </p>
          <div className="flex items-center justify-between mt-3">
            {fragrance.averageRating > 0 ? (
              <RatingStars rating={fragrance.averageRating * 2} size="sm" showValue />
            ) : (
              <span className="text-xs text-muted-foreground">No ratings yet</span>
            )}
            <span className="text-xs text-muted-foreground">
              {fragrance.reviewCount} {fragrance.reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
