"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Inbox,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { Lead, LeadListResponse, LeadStats, LeadStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { KindBadge, StatusBadge } from "@/components/status-badge";

interface DailyPoint {
  date: string;
  count: number;
}

const STATUS_OPTIONS: (LeadStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "PILOT",
  "PARTNERSHIP",
];

// ---------- Modern chart ----------

function Chart({ data, status }: { data: DailyPoint[]; status: LeadStatus | "ALL" }) {
  if (!data.length) return null;
  const W = 780;
  const H = 260;
  const PAD_L = 40;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const max = Math.max(3, ...data.map((d) => d.count));
  const step = innerW / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = PAD_L + i * step;
    const y = PAD_T + innerH - (d.count / max) * innerH;
    return { x, y, ...d };
  });

  // Smooth curve via Catmull-Rom → Bezier
  const linePath = (() => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  })();

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)} Z`;

  const ticks = 4;
  // Distinct colour per status for chart
  const palette: Record<string, { stroke: string; from: string; to: string }> = {
    ALL: { stroke: "#075ea8", from: "#2fa8d7", to: "#2fa8d7" },
    NEW: { stroke: "#2fa8d7", from: "#2fa8d7", to: "#2fa8d7" },
    IN_PROGRESS: { stroke: "#7c3aed", from: "#a78bfa", to: "#a78bfa" },
    CONTACTED: { stroke: "#0891b2", from: "#22d3ee", to: "#22d3ee" },
    NDA_SIGNED: { stroke: "#1e40af", from: "#60a5fa", to: "#60a5fa" },
    PILOT: { stroke: "#d97706", from: "#fbbf24", to: "#fbbf24" },
    PARTNERSHIP: { stroke: "#059669", from: "#34d399", to: "#34d399" },
    REJECTED: { stroke: "#dc2626", from: "#f87171", to: "#f87171" },
    ARCHIVED: { stroke: "#475569", from: "#94a3b8", to: "#94a3b8" },
  };
  const colour = palette[status] ?? palette.ALL;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id={`area-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colour.from} stopOpacity="0.42" />
          <stop offset="55%" stopColor={colour.to} stopOpacity="0.16" />
          <stop offset="100%" stopColor={colour.to} stopOpacity="0" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid */}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = PAD_T + (innerH * i) / ticks;
        const value = Math.round(max - (max * i) / ticks);
        return (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="rgba(7,94,168,0.07)"
              strokeDasharray="3 4"
            />
            <text
              x={PAD_L - 8}
              y={y + 4}
              fontSize="11"
              fontWeight="600"
              textAnchor="end"
              fill="rgba(6,59,102,0.55)"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Area + line */}
      <path d={areaPath} fill={`url(#area-${status})`} />
      <path
        d={linePath}
        fill="none"
        stroke={colour.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lineGlow)"
      />

      {/* Points with hover */}
      {points.map((p, i) => {
        const showLabel =
          i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2);
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#fff"
              stroke={colour.stroke}
              strokeWidth="2.5"
            />
            <title>{`${p.date}: ${p.count}`}</title>
            {showLabel && (
              <text
                x={p.x}
                y={H - 10}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                fill="rgba(6,59,102,0.6)"
              >
                {p.date.slice(5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Stat card ----------

interface StatCardProps {
  href: string;
  label: string;
  value: number | string;
  hint?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "primary" | "cyan" | "navy";
}

function StatCard({ href, label, value, hint, Icon, tone = "primary" }: StatCardProps) {
  const toneCls = {
    primary: "from-brand-600 to-brand-400",
    cyan: "from-cyan-400 to-brand-400",
    navy: "from-brand-700 to-brand-600",
  }[tone];
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_30px_70px_rgba(8,80,135,0.16)]"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneCls} text-white shadow-[0_10px_24px_rgba(7,94,168,0.30)]`}
        >
          <Icon size={20} />
        </div>
        <ArrowUpRight
          size={18}
          className="text-brand-700/40 transition group-hover:text-brand-600"
        />
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-brand-700">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {label}
      </div>
      {hint && <div className="mt-2 text-[11px] text-brand-700/50">{hint}</div>}
    </Link>
  );
}

// ---------- Recent leads ----------

function RecentLeads() {
  const { t, lang } = useLang();
  const q = useQuery({
    queryKey: ["recent-leads"],
    queryFn: () =>
      api<LeadListResponse>("/leads", { query: { page: 1, pageSize: 10 } }),
  });

  const items: Lead[] = q.data?.items ?? [];

  return (
    <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(8,80,135,0.08)] px-6 py-4 lg:px-8">
        <div>
          <h2 className="text-xl font-black text-brand-700">
            {lang === "ru" ? "Последние заявки" : "Recent applications"}
          </h2>
          <p className="mt-0.5 text-xs text-brand-700/60">
            {lang === "ru"
              ? "Десять самых свежих заявок."
              : "Ten most recent applications."}
          </p>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100"
        >
          {lang === "ru" ? "Все заявки" : "All applications"} →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-50/40 text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
            <tr>
              <th className="px-4 py-3 lg:pl-6">{t("colDate")}</th>
              <th className="px-4 py-3">{t("colKind")}</th>
              <th className="px-4 py-3">{t("colContact")}</th>
              <th className="px-4 py-3">{t("colCompanyOrRole")}</th>
              <th className="px-4 py-3">{t("colEmail")}</th>
              <th className="px-4 py-3">{t("colStatus")}</th>
              <th className="px-4 py-3 text-right lg:pr-6">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(8,80,135,0.06)]">
            {q.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-700/60">
                  {t("loading")}
                </td>
              </tr>
            )}
            {!q.isLoading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-700/60">
                  {t("noLeads")}
                </td>
              </tr>
            )}
            {items.map((lead) => (
              <tr key={lead.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 text-xs text-brand-700/70 lg:pl-6">
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
                <td className="px-4 py-3 text-right lg:pr-6">
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
  );
}

// ---------- Page ----------

export default function MainPage() {
  const { t, lang } = useLang();
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => api<LeadStats>("/leads/stats"),
  });
  const [chartStatus, setChartStatus] = useState<LeadStatus | "ALL">("ALL");
  const daily = useQuery({
    queryKey: ["daily", 14, chartStatus],
    queryFn: () =>
      api<DailyPoint[]>("/leads/daily", {
        query: { days: 14, status: chartStatus === "ALL" ? undefined : chartStatus },
      }),
  });

  const totalInRange = useMemo(
    () => (daily.data ?? []).reduce((sum, p) => sum + p.count, 0),
    [daily.data],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex items-center gap-4">
        <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
        <h1 className="text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
          {t("dashboard")}
        </h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/leads?status=NEW"
          label={t("status_NEW")}
          value={stats.data?.byStatus.NEW ?? "—"}
          Icon={Sparkles}
          tone="cyan"
        />
        <StatCard
          href="/leads?status=IN_PROGRESS"
          label={t("status_IN_PROGRESS")}
          value={stats.data?.byStatus.IN_PROGRESS ?? "—"}
          Icon={Layers}
          tone="primary"
        />
        <StatCard
          href="/leads?status=PARTNERSHIP"
          label={t("status_PARTNERSHIP")}
          value={stats.data?.byStatus.PARTNERSHIP ?? "—"}
          Icon={TrendingUp}
          tone="navy"
        />
        <StatCard
          href="/leads"
          label={t("last7days")}
          value={stats.data?.last7 ?? "—"}
          hint={stats.data ? `${t("total")}: ${stats.data.total}` : undefined}
          Icon={Inbox}
          tone="primary"
        />
      </div>

      {/* Chart */}
      <div className="mb-8 rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl lg:p-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-brand-700">{t("dailyTitle")}</h2>
            <p className="mt-1 text-xs text-brand-700/60">{t("dailySubtitle")}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-brand-700">{totalInRange}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/55">
              {lang === "ru" ? "за 14 дней" : "in 14 days"}
            </div>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const active = chartStatus === s;
            const label = s === "ALL" ? t("filterAll") : t(`status_${s}` as const);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setChartStatus(s)}
                className={
                  "h-7 rounded-full px-3 text-[11px] font-bold transition " +
                  (active
                    ? "bg-brand-700 text-white shadow-[0_4px_12px_rgba(6,59,102,0.25)]"
                    : "bg-brand-50/60 text-brand-700/70 hover:bg-brand-100")
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {daily.isLoading ? (
          <div className="py-12 text-center text-sm text-brand-700/60">{t("loading")}</div>
        ) : daily.data && daily.data.length > 0 ? (
          <Chart data={daily.data} status={chartStatus} />
        ) : (
          <div className="py-12 text-center text-sm text-brand-700/60">{t("noData")}</div>
        )}
      </div>

      <RecentLeads />
    </div>
  );
}
