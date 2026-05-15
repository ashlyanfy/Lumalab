"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { CmsPage } from "@/lib/types";

export default function SeoListPage() {
  const { t } = useLang();
  const pages = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => api<CmsPage[]>("/pages"),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex items-center gap-4">
        <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
        <h1 className="text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
          {t("seo")}
        </h1>
      </div>
      <p className="-mt-6 mb-8 text-sm text-brand-700/60">{t("seoSubtitle")}</p>

      <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        {pages.isLoading ? (
          <div className="p-8 text-center text-sm text-brand-700/60">{t("loading")}</div>
        ) : pages.data && pages.data.length > 0 ? (
          <ul className="divide-y divide-[rgba(8,80,135,0.08)]">
            {pages.data.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/seo/${p.slug}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-brand-50/40 sm:p-5"
                >
                  <div className="flex items-center gap-3 text-brand-700">
                    <Search size={18} className="text-brand-400" />
                    <div>
                      <div className="text-sm font-bold">{p.title}</div>
                      <div className="text-xs text-brand-700/60">/{p.slug}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-sm text-brand-700/60">{t("noPages")}</div>
        )}
      </div>
    </div>
  );
}
