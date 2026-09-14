import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  phone: z
    .string()
    .trim()
    .max(20, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  serviceArea: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  isProvider: z.boolean(),
});
