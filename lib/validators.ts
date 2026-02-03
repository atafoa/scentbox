import { z } from "zod";

export const reviewSchema = z.object({
  fragranceId: z.string().min(1),
  rating: z.number().min(1).max(10),
  content: z.string().min(10).max(5000),
  longevity: z.number().min(1).max(10).optional(),
  sillage: z.number().min(1).max(10).optional(),
  value: z.number().min(1).max(10).optional(),
  season: z.string().optional(),
});

export const listSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const listItemSchema = z.object({
  fragranceId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const collectionSchema = z.object({
  status: z.enum(["WANT", "TRIED", "OWN"]),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const userFragranceSchema = z.object({
  fragranceId: z.string().min(1),
  status: z.enum(["WANT", "TRIED", "OWN"]),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
});

export const fragranceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  brandId: z.string().optional(),
  brandName: z.string().min(1, "Brand is required").max(100),
  concentration: z.enum(["EAU_FRAICHE", "EAU_DE_COLOGNE", "EAU_DE_TOILETTE", "EAU_DE_PARFUM", "PARFUM", "EXTRAIT"]),
  gender: z.enum(["MASCULINE", "FEMININE", "UNISEX"]),
  releaseYear: z.number().int().min(1900).max(2030).optional().nullable(),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional().or(z.literal("")),
  notes: z.array(z.object({
    noteId: z.string(),
    layer: z.enum(["TOP", "MIDDLE", "BASE"]),
  })).optional(),
});
