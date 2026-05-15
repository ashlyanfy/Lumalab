"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Inbox, Layers, Sparkles, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { LeadStats } from "@/lib/types";

interface DailyPoint {
  date: string;
  count: number;
}

function Chart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return null;
  const W = 720;
  const H = 220;
  const PAD_L = 32;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = innerW / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = PAD_L + i * step;
    const y = PAD_T + innerH - (d.count / max) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)} Z`;

  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2fa8d7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2fa8d7" stopOpacity="0" />
        </linearGradient>
      </defs>
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
              stroke="rgba(7,94,168,0.08)"
              strokeDasharray="2 3"
            />
            <text x={4} y={y + 3} fontSize="10" fill="rgba(6,59,102,0.55)">
              {value}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#075ea8" strokeWidth="2" strokeLinecap="round" />
      {points.map((p, i) => {
        const showLabel = i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#2fa8d7" stroke="#fff" strokeWidth="1.5" />
            {showLabel && (
              <text
                x={p.x}
                y={H - 8}
                fontSize="10"
                textAnchor="middle"
                fill="rgba(6,59,102,0.55)"
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

export default function MainPage() {
  const { t } = useLang();
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => api<LeadStats>("/leads/stats"),
  });
  const daily = useQuery({
    queryKey: ["daily", 14],
    queryFn: () => api<DailyPoint[]>("/leads/daily", { query: { days: 14 } }),
  });

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

      <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl lg:p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-black text-brand-700">{t("dailyTitle")}</h2>
            <p className="mt-1 text-xs text-brand-700/60">{t("dailySubtitle")}</p>
          </div>
        </div>
        {daily.isLoading ? (
          <div className="py-12 text-center text-sm text-brand-700/60">{t("loading")}</div>
        ) : daily.data && daily.data.length > 0 ? (
          <Chart data={daily.data} />
        ) : (
          <div className="py-12 text-center text-sm text-brand-700/60">{t("noData")}</div>
        )}
      </div>
    </div>
  );
}
