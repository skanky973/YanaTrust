import { z } from "zod";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { REQUEST_STATUSES } from "@/lib/requests/status";

const CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

const STATUS_VALUES = REQUEST_STATUSES.map((s) => s.value) as [
  string,
  ...string[],
];

export const requestFormSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit faire au moins 3 caractères.").max(150),
  category: z.enum(CATEGORY_VALUES, {
    error: "Choisissez une catégorie.",
  }),
  description: z
    .string()
    .trim()
    .min(10, "La description doit faire au moins 10 caractères.")
    .max(3000),
  budget: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
      "Budget invalide.",
    ),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  desiredDate: z.string().trim().optional().or(z.literal("")),
});

export const requestUpdateSchema = requestFormSchema.extend({
  status: z.enum(STATUS_VALUES, { error: "Statut invalide." }),
});
