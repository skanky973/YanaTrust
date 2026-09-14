import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide.")
    .max(20, "Numéro de téléphone invalide."),
  city: z.string().trim().min(1, "La ville est requise.").max(100),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
