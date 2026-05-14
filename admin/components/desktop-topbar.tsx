"use client";

import { useLang } from "@/lib/i18n";
import { Logo } from "./logo";

export function DesktopTopbar() {
  const { lang } = useLang();
  return (
    <header className="sticky top-0 z-20 hidden h-20 items-center gap-6 border-b border-[rgba(8,80,135,0.10)] bg-white/70 px-8 backdrop-blur-xl lg:flex">
      <div className="flex-1" />
      <div className="flex flex-col items-end">
        <Logo size="sm" />
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">
          {lang === "ru" ? "Админ" : "Admin"}
        </span>
      </div>
    </header>
  );
}
