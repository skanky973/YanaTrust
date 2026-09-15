import { z } from "zod";

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
