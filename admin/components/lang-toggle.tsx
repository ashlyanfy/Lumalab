"use client";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-[rgba(8,80,135,0.16)] bg-white/80 p-1 text-xs font-bold">
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cn(
            "h-7 rounded-full px-3 uppercase tracking-wide transition",
            lang === l
              ? "bg-brand-700 text-white shadow"
              : "text-brand-700/60 hover:text-brand-700",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
