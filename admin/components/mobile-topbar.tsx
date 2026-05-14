"use client";

import { Menu } from "lucide-react";
import { Logo } from "./logo";

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-[rgba(8,80,135,0.10)] bg-white shadow-[0_4px_12px_rgba(8,80,135,0.06)] lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(8,80,135,0.12)] bg-white text-brand-700 hover:bg-brand-50"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <Logo size="sm" />
        <div className="w-10" aria-hidden />
      </div>
    </div>
  );
}
