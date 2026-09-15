import { z } from "zod";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

const CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

export const interventionFormSchema = z.object({
  clientId: z.string().uuid("Sélectionnez un client."),
  title: z.string().trim().min(3, "Le titre doit faire au moins 3 caractères.").max(150),
  category: z.enum(CATEGORY_VALUES, { error: "Choisissez une catégorie." }),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  clientPhone: z.string().trim().max(30).optional().or(z.literal("")),
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

export const completionReportSchema = z.object({
  workNotes: z.string().trim().min(5, "Décrivez le travail effectué."),
  materialsUsed: z.string().trim().max(1000).optional().or(z.literal("")),
  finalPrice: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
      "Montant invalide.",
    ),
  needsFollowup: z.boolean(),
});

export const clientValidationSchema = z.object({
  decision: z.enum(["confirm", "problem"]),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
  rating: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number(v) : null))
    .refine(
      (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 5),
      "Note invalide.",
    ),
});
