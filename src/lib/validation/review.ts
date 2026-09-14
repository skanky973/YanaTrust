import { z } from "zod";

const optionalRating = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? Number(value) : null))
  .refine(
    (value) => value === null || (Number.isInteger(value) && value >= 1 && value <= 5),
    "Note invalide (1 à 5).",
  );

export const reviewFormSchema = z.object({
  rating: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine(
      (value) => Number.isInteger(value) && value >= 1 && value <= 5,
      "Choisissez une note entre 1 et 5.",
    ),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
  punctuality: optionalRating,
  quality: optionalRating,
  communication: optionalRating,
});
