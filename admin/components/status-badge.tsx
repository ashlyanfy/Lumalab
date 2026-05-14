import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import type { LeadKind, LeadStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CONTACTED: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  NDA_SIGNED: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  PILOT: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PARTNERSHIP: "bg-brand-400/15 text-brand-600 ring-1 ring-brand-400/30",
  REJECTED: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  ARCHIVED: "bg-slate-50 text-slate-400 ring-1 ring-slate-200",
};

const kindStyles: Record<LeadKind, string> = {
  COMPANY: "bg-brand-700 text-white",
  TALENT: "bg-brand-400 text-white",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        statusStyles[status],
      )}
    >
      {t(`status_${status}` as const)}
    </span>
  );
}

export function KindBadge({ kind }: { kind: LeadKind }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        kindStyles[kind],
      )}
    >
      {t(`kind_${kind}` as const)}
    </span>
  );
}
