"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { CmsPage } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

export default function SeoEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();
  const qc = useQueryClient();

  const pageQ = useQuery({
    queryKey: ["cms-page", slug],
    queryFn: () => api<CmsPage>(`/pages/${slug}`),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (pageQ.data?.seo) {
      setTitle(pageQ.data.seo.title ?? "");
      setDescription(pageQ.data.seo.description ?? "");
      setKeywords(pageQ.data.seo.keywords ?? "");
      setOgImage(pageQ.data.seo.ogImage ?? "");
    } else if (pageQ.data) {
      setTitle(pageQ.data.title);
    }
  }, [pageQ.data]);

  const save = useMutation({
    mutationFn: () =>
      api(`/pages/${slug}/seo`, {
        method: "PUT",
        body: JSON.stringify({ title, description, keywords, ogImage }),
      }),
    onSuccess: () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
      qc.invalidateQueries({ queryKey: ["cms-page", slug] });
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      <Link
        href="/seo"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700/70 hover:text-brand-600"
      >
        <ArrowLeft size={16} /> SEO
      </Link>

      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
          /{slug}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
          SEO · {pageQ.data?.title ?? slug}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-4 rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl"
        >
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("seoTitle")}
            </span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("seoDescription")}
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-[rgba(8,80,135,0.16)] bg-white/80 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("seoKeywords")}
            </span>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} maxLength={500} />
          </label>
          <label className="grid gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {t("seoOgImage")}
            </span>
            <Input
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
          </label>
          <Button
            type="submit"
            disabled={save.isPending}
            className={pulse ? "save-glow" : undefined}
          >
            <Save size={16} /> {save.isPending ? t("saving") : t("save")}
          </Button>
        </form>

        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
            {t("preview")}
          </p>
          <div className="rounded-[24px] border border-[rgba(8,80,135,0.10)] bg-white p-5 shadow-[0_12px_28px_rgba(8,80,135,0.06)]">
            <div className="text-xs text-emerald-700">https://lumalab.asia › {slug}</div>
            <div className="mt-1 text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer">
              {title || "—"}
            </div>
            <div className="mt-1 text-sm text-[#4d5156] line-clamp-3">
              {description || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
