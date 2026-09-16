import { z } from "zod";

export const tripFormSchema = z.object({
  originCity: z.string().trim().min(2, "Ville de départ requise.").max(100),
  destinationCity: z.string().trim().min(2, "Ville d'arrivée requise.").max(100),
  departureDate: z.string().trim().min(1, "Date requise."),
  departureTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Heure invalide."),
  seatsTotal: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0 && v <= 8, "Nombre de places invalide (1 à 8)."),
  pricePerSeat: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v) && v >= 0, "Prix invalide."),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});
