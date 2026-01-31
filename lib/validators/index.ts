import { z } from "zod";

export const reviewSchema = z.object({
  fragranceId: z.string().min(1),
  rating: z.number().min(1).max(10),
  content: z.string().min(10, "Review must be at least 10 characters").max(5000),
  longevity: z.number().min(1).max(10).optional(),
  sillage: z.number().min(1).max(10).optional(),
  value: z.number().min(1).max(10).optional(),
  season: z.enum(["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASONS"]).optional(),
});

export const userFragranceSchema = z.object({
  fragranceId: z.string().min(1),
  status: z.enum(["WANT", "TRIED", "OWN"]),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const listSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const listItemSchema = z.object({
  listId: z.string().min(1),
  fragranceId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type UserFragranceInput = z.infer<typeof userFragranceSchema>;
export type ListInput = z.infer<typeof listSchema>;
export type ListItemInput = z.infer<typeof listItemSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
