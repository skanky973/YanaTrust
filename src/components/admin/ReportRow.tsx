import Link from "next/link";
import {
  markReportReviewed,
  dismissReport,
  archiveReportedService,
} from "@/lib/actions/moderation";
import type { ReportWithContext } from "@/lib/moderation/queries";

const TARGET_TYPE_LABELS: Record<string, string> = {
  profile: "Profil",
  service: "Service",
  message: "Message",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-brand-green/15 text-brand-green-dark",
  dismissed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  reviewed: "Traité",
  dismissed: "Rejeté",
};

function targetHref(report: ReportWithContext): string | null {
  if (report.target_type === "profile") return `/prestataires/${report.target_id}`;
  if (report.target_type === "service") return `/services/${report.target_id}`;
  return null;
}

export function ReportRow({ report }: { report: ReportWithContext }) {
  const href = targetHref(report);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-brand-ink/50">
            {TARGET_TYPE_LABELS[report.target_type] ?? report.target_type}
          </p>
          {href ? (
            <Link href={href} className="font-semibold text-brand-ink hover:underline">
              {report.targetLabel}
            </Link>
          ) : (
            <p className="font-semibold text-brand-ink">{report.targetLabel}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[report.status] ?? "bg-brand-ink/10 text-brand-ink/60"}`}
        >
          {STATUS_LABELS[report.status] ?? report.status}
        </span>
      </div>

      <p className="text-sm text-brand-ink/70">{report.reason}</p>

      <p className="text-xs text-brand-ink/50">
        Signalé par{" "}
        {report.reporter ? `${report.reporter.first_name} ${report.reporter.last_name}` : "un utilisateur"}
        {" · "}
        {new Date(report.created_at).toLocaleDateString("fr-FR")}
      </p>

      {report.status === "pending" ? (
        <div className="flex flex-wrap gap-2">
          <form action={markReportReviewed.bind(null, report.id)}>
            <button
              type="submit"
              className="rounded-lg bg-brand-green-dark px-3 py-1.5 text-sm font-medium text-brand-cream"
            >
              Marquer traité
            </button>
          </form>
          <form action={dismissReport.bind(null, report.id)}>
            <button
              type="submit"
              className="rounded-lg bg-brand-ink/5 px-3 py-1.5 text-sm font-medium text-brand-ink/70"
            >
              Rejeter (non fondé)
            </button>
          </form>
          {report.target_type === "service" && report.targetServiceId ? (
            <form action={archiveReportedService.bind(null, report.id, report.targetServiceId)}>
              <button
                type="submit"
                className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
              >
                Archiver ce service
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
