import { z } from "zod";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

const CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

export const proposalFormSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit faire au moins 3 caractères.").max(150),
  category: z.enum(CATEGORY_VALUES, { error: "Choisissez une catégorie." }),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  clientPhone: z.string().trim().max(30).optional().or(z.literal("")),
  conditions: z.string().trim().max(1000).optional().or(z.literal("")),
  scheduledDate: z.string().trim().min(1, "La date est requise."),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Heure invalide."),
  durationMinutes: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, "Durée invalide."),
  price: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
      "Prix invalide.",
    ),
});
