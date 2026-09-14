import {
  Home,
  Hammer,
  Leaf,
  Truck,
  Wrench,
  Sparkles,
  GraduationCap,
  Car,
  PartyPopper,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/services/categories";

export const CATEGORY_ICONS: Record<ServiceCategory, LucideIcon> = {
  menage: Home,
  bricolage: Hammer,
  jardinage: Leaf,
  demenagement: Truck,
  reparation: Wrench,
  beaute_bien_etre: Sparkles,
  cours_particuliers: GraduationCap,
  transport: Car,
  evenementiel: PartyPopper,
  autre: MoreHorizontal,
};

// Teintes dérivées uniquement des couleurs de marque (vert, or), en variant
// l'opacité pour garder de la diversité visuelle sans sortir de la charte.
export const CATEGORY_TILE_STYLES = [
  "bg-brand-green/12 text-brand-green-dark",
  "bg-brand-gold/20 text-brand-green-dark",
  "bg-brand-green-dark/10 text-brand-green-dark",
  "bg-brand-gold/12 text-brand-ink",
];
