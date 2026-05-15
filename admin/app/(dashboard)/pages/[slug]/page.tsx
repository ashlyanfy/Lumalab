"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { PageEditor } from "./page-editor";

export default function PageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700/70 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> {t("pages")}
        </Link>
        <Link
          href={`/seo/${slug}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100"
        >
          <Search size={14} /> SEO
        </Link>
      </div>
      <PageEditor slug={slug} />
    </div>
  );
}
