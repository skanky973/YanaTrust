import { z } from "zod";

// L'expression précédemment utilisée, /^\d{2}:\d{2}$/, ne vérifiait que la
// forme : "25:00" et "12:99" la satisfaisaient. Postgres refusait ensuite la
// valeur au moment de l'insertion, et l'utilisateur recevait une erreur
// générique ("Impossible de publier le trajet") sans savoir quoi corriger.
//
// Celle-ci contraint aussi les valeurs : heures de 00 à 23, minutes de 00 à 59.
export const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const heureSchema = z
  .string()
  .trim()
  .regex(HEURE_REGEX, "Heure invalide (format attendu : 08:30).");
