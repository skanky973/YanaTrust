import { z } from "zod";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

const CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

export const serviceFormSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit faire au moins 3 caractères.").max(150),
  category: z.enum(CATEGORY_VALUES, {
    error: "Choisissez une catégorie.",
  }),
  description: z
    .string()
    .trim()
    .min(10, "La description doit faire au moins 10 caractères.")
    .max(3000),
  priceFrom: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
      "Prix invalide.",
    ),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  serviceArea: z.string().trim().max(200).optional().or(z.literal("")),
});
