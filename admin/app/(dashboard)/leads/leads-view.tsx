"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, RefreshCw, Search as SearchIcon } from "lucide-react";
import { ExportModal } from "@/components/export-modal";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type {
  LeadKind,
  LeadListResponse,
  LeadStatus,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { KindBadge, StatusBadge } from "@/components/status-badge";

const PAGE_SIZE = 20;

const STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "NDA_SIGNED",
  "PILOT",
  "PARTNERSHIP",
  "REJECTED",
  "ARCHIVED",
];

export function LeadsView() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [kind, setKind] = useState<LeadKind | "">(
    (searchParams.get("kind") as LeadKind | null) ?? "",
  );
  const [status, setStatus] = useState<LeadStatus | "">(
    (searchParams.get("status") as LeadStatus | null) ?? "",
  );
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [exportOpen, setExportOpen] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, kind, status, from, to]);

  const query = useQuery({
    queryKey: ["leads", { q, kind, status, from, to, page }],
    queryFn: () =>
      api<LeadListResponse>("/leads", {
        query: { q, kind, status, from, to, page, pageSize: PAGE_SIZE },
      }),
  });

  function resetFilters() {
    setQ("");
    setKind("");
    setStatus("");
    setFrom("");
    setTo("");
    setPage(1);
    router.replace("/leads");
  }

  const data = query.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
              {t("leads")}
            </h1>
            <p className="mt-1 text-sm text-brand-700/60">{t("leadsSubtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw size={14} className={query.isFetching ? "animate-spin" : ""} />
            {t("refresh")}
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            <Download size={14} />
            {t("exportExcel")}
          </Button>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        defaults={{ kind, status, from, to }}
      />

      {/* Kind tabs */}
      <div className="mb-5 inline-flex rounded-full border border-[rgba(8,80,135,0.10)] bg-white/85 p-1 shadow-[0_12px_28px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        {(
          [
            { value: "", label: t("filterAll") },
            { value: "COMPANY", label: t("kind_COMPANY") },
            { value: "TALENT", label: t("kind_TALENT") },
          ] as { value: LeadKind | ""; label: string }[]
        ).map((tab) => {
          const active = kind === tab.value;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setKind(tab.value)}
              className={
                "h-9 rounded-full px-5 text-sm font-bold transition " +
                (active
                  ? "bg-brand-700 text-white shadow-[0_8px_20px_rgba(7,59,102,0.25)]"
                  : "text-brand-700/70 hover:bg-brand-50")
              }
            >
              {tab.label}
              {data && active && tab.value !== "" && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px] font-bold">
                  {data.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-[26px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-5 shadow-[0_18px_44px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-700/40"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search")}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | "")}
          >
            <option value="">{t("filterStatus")}: {t("filterAll")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status_${s}` as const)}
              </option>
            ))}
          </Select>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("pickFromDate")}
            </span>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label={t("pickFromDate")}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("pickToDate")}
            </span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label={t("pickToDate")}
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t("resetFilters")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[26px] border border-[rgba(8,80,135,0.08)] bg-white/85 shadow-[0_18px_44px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50/60 text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
              <tr>
                <th className="px-4 py-3">{t("colDate")}</th>
                <th className="px-4 py-3">{t("colKind")}</th>
                <th className="px-4 py-3">{t("colContact")}</th>
                <th className="px-4 py-3">{t("colCompanyOrRole")}</th>
                <th className="px-4 py-3">{t("colEmail")}</th>
                <th className="px-4 py-3">{t("colStatus")}</th>
                <th className="px-4 py-3 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(8,80,135,0.06)]">
              {query.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-brand-700/60">
                    {t("loading")}
                  </td>
                </tr>
              )}
              {query.isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                    {t("loadError")}
                  </td>
                </tr>
              )}
              {data && data.items.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-brand-700/60">
                    {t("noLeads")}
                  </td>
                </tr>
              )}
              {data?.items.map((lead) => (
                <tr key={lead.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3 text-xs text-brand-700/70">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <KindBadge kind={lead.kind} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-900">
                    {lead.contactName}
                  </td>
                  <td className="px-4 py-3 text-brand-900/80">
                    {lead.kind === "COMPANY"
                      ? lead.companyName ?? "—"
                      : lead.desiredRole ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-700/80">{lead.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-sm font-bold text-brand-600 hover:text-brand-700"
                    >
                      {t("open")} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-brand-700/70">
          <span>
            {t("total")}: <strong className="text-brand-700">{data.total}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
              {t("prev")}
            </Button>
            <span className="text-xs">
              {t("page")} {data.page} / {data.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("next")}
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
