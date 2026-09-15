import { z } from "zod";

export const applicationFormSchema = z.object({
  message: z.string().trim().min(10, "Décrivez votre proposition en quelques mots.").max(2000),
  proposedPrice: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!isNaN(Number(value)) && Number(value) >= 0),
      "Prix invalide.",
    ),
  estimatedDurationMinutes: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0),
      "Durée invalide.",
    ),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
