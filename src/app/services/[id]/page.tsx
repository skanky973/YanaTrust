import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/services/queries";
import { getCategoryLabel } from "@/lib/services/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  return { title: service ? `${service.title} — YanaTrust` : "Service — YanaTrust" };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service || service.status !== "active") {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <span className="rounded-full bg-brand-gold/25 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
          {getCategoryLabel(service.category)}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-brand-ink">
          {service.title}
        </h1>
        {service.price_from !== null ? (
          <p className="mt-1 text-brand-green-dark font-semibold">
            À partir de {service.price_from} €
          </p>
        ) : null}
      </div>

      <p className="whitespace-pre-line rounded-xl bg-white p-4 text-sm text-brand-ink/80">
        {service.description}
      </p>

      <dl className="grid gap-3 rounded-xl bg-white p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Ville</dt>
          <dd className="font-medium text-brand-ink">
            {service.city || "—"}
          </dd>
        </div>
        {service.service_area ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/60">Zone d&rsquo;intervention</dt>
            <dd className="font-medium text-brand-ink">
              {service.service_area}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Prestataire</dt>
          <dd className="font-medium text-brand-ink">
            {service.provider
              ? `${service.provider.first_name} ${service.provider.last_name}`
              : "—"}
          </dd>
        </div>
      </dl>

      <Link
        href="/recherche"
        className="text-center text-sm text-brand-green-dark"
      >
        ← Retour à la recherche
      </Link>
    </div>
  );
}
