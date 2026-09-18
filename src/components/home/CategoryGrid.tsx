import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { CATEGORY_ICONS, CATEGORY_TILE_STYLES } from "@/lib/services/category-icons";

export function CategoryGrid() {
  return (
    /* Trois colonnes plutôt que quatre : à 390 px de large, quatre tuiles
       laissaient trop peu de place aux libellés, qui passaient sur deux
       lignes ("Beauté & bien-être", "Cours particuliers"). Les neuf
       catégories remplissent exactement trois lignes, sans orphelin. */
    <div className="grid grid-cols-3 gap-x-3 gap-y-4">
      {SERVICE_CATEGORIES.filter((c) => c.value !== "autre").map(
        ({ value, label }, i) => {
          const Icon = CATEGORY_ICONS[value];
          const tileStyle = CATEGORY_TILE_STYLES[i % CATEGORY_TILE_STYLES.length];

          return (
            <Link
              key={value}
              href={`/recherche?categorie=${value}`}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tileStyle}`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="text-center text-xs font-medium leading-tight text-brand-ink/80">
                {label}
              </span>
            </Link>
          );
        },
      )}
    </div>
  );
}
