"use client";

import { useLang } from "@/lib/i18n";

export default function MainPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
          LumaLab
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
          {t("dashboard")}
        </h1>
      </div>

      <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-10 text-center shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        <p className="text-sm text-brand-700/70">{t("dashboardSoon")}</p>
      </div>
    </div>
  );
}
