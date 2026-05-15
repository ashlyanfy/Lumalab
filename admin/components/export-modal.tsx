"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { downloadFile } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { LeadKind, LeadStatus } from "@/lib/types";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";

const KINDS: LeadKind[] = ["COMPANY", "TALENT"];
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

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled defaults from the list's current filters. */
  defaults?: {
    kind?: LeadKind | "";
    status?: LeadStatus | "";
    from?: string;
    to?: string;
  };
}

export function ExportModal({ open, onClose, defaults }: ExportModalProps) {
  const { t } = useLang();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState<LeadKind | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFrom(defaults?.from ?? "");
      setTo(defaults?.to ?? "");
      setKind(defaults?.kind ?? "");
      setStatus(defaults?.status ?? "");
      setError(null);
    }
  }, [open, defaults]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function quickRange(days: number) {
    setFrom(isoDateOffset(days - 1));
    setTo(todayISO());
  }

  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (kind) params.set("kind", kind);
      if (status) params.set("status", status);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      const stamp = todayISO();
      await downloadFile(
        `/leads/export${qs ? `?${qs}` : ""}`,
        `lumalab-leads-${stamp}.xlsx`,
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg rounded-[28px] border border-[rgba(8,80,135,0.10)] bg-white p-6 shadow-[0_28px_80px_rgba(8,80,135,0.20)] lg:p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-brand-700">
              <Download size={18} />
              <h2 className="text-xl font-black tracking-tight">{t("exportExcel")}</h2>
            </div>
            <p className="mt-1 text-xs text-brand-700/60">{t("exportHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("exportQuick")}
            </div>
            <div className="flex flex-wrap gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => quickRange(d)}
                  className="h-9 rounded-full bg-brand-50 px-4 text-xs font-bold text-brand-700 hover:bg-brand-100"
                >
                  {t("exportLastN").replace("{n}", String(d))}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
                className="h-9 rounded-full bg-slate-100 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                {t("exportAllTime")}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                {t("fromDate")}
              </span>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                {t("toDate")}
              </span>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                {t("filterKind")}
              </span>
              <Select value={kind} onChange={(e) => setKind(e.target.value as LeadKind | "")}>
                <option value="">{t("filterAll")}</option>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`kind_${k}` as const)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                {t("filterStatus")}
              </span>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus | "")}
              >
                <option value="">{t("filterAll")}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status_${s}` as const)}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
              {t("cancel")}
            </Button>
            <Button onClick={handleExport} disabled={busy}>
              <Download size={16} />
              {busy ? t("loading") : t("exportExcel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
