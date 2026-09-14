import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { CATEGORY_ICONS, CATEGORY_TILE_STYLES } from "@/lib/services/category-icons";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {SERVICE_CATEGORIES.filter((c) => c.value !== "autre").map(
        ({ value, label }, i) => {
          const Icon = CATEGORY_ICONS[value];
          const tileStyle = CATEGORY_TILE_STYLES[i % CATEGORY_TILE_STYLES.length];

          return (
            <Link
              key={value}
              href={`/recherche?categorie=${value}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tileStyle}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-brand-ink/80">
                {label}
              </span>
            </Link>
          );
        },
      )}
    </div>
  );
}
