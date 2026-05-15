"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus, FileText, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { CmsPage } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

export default function PagesListPage() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  const pages = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => api<CmsPage[]>("/pages"),
  });

  const create = useMutation({
    mutationFn: (payload: { slug: string; title: string }) =>
      api<CmsPage>("/pages", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      setSlug("");
      setTitle("");
      qc.invalidateQueries({ queryKey: ["cms-pages"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-2 flex items-center gap-4">
        <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
        <h1 className="text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
          {t("pages")}
        </h1>
      </div>
      <p className="mb-8 text-sm text-brand-700/60">{t("pagesSubtitle")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!slug.trim() || !title.trim()) return;
          create.mutate({ slug: slug.trim(), title: title.trim() });
        }}
        className="mb-6 rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-700">
          <FilePlus size={16} /> {t("newPage")}
        </div>
        <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto]">
          <Input
            placeholder={t("pageSlug")}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Input
            placeholder={t("pageTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? t("saving") : t("save")}
          </Button>
        </div>
      </form>

      <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        {pages.isLoading ? (
          <div className="p-8 text-center text-sm text-brand-700/60">{t("loading")}</div>
        ) : pages.data && pages.data.length > 0 ? (
          <ul className="divide-y divide-[rgba(8,80,135,0.08)]">
            {pages.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <Link
                  href={`/pages/${p.slug}`}
                  className="flex flex-1 items-center gap-3 text-brand-700 hover:text-brand-600"
                >
                  <FileText size={18} className="shrink-0 text-brand-400" />
                  <div>
                    <div className="text-sm font-bold">{p.title}</div>
                    <div className="text-xs text-brand-700/60">/{p.slug}</div>
                  </div>
                </Link>
                <Link
                  href={`/seo/${p.slug}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100"
                >
                  <Search size={14} /> SEO
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
