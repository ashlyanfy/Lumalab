"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Search,
  Settings as SettingsIcon,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api, clearToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LangToggle } from "./lang-toggle";
import { Logo } from "./logo";
import type { Role } from "@/lib/types";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
    staleTime: 5 * 60_000,
  });

  const isAdmin = me.data?.role === "ADMIN";

  const nav = [
    { href: "/main", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/leads", label: t("navLeads"), icon: Inbox },
    ...(isAdmin
      ? [
          { href: "/pages", label: t("navPages"), icon: LayoutGrid },
          { href: "/seo", label: t("navSeo"), icon: Search },
          { href: "/users", label: t("navUsers"), icon: UsersIcon },
          { href: "/settings", label: t("navSettings"), icon: SettingsIcon },
        ]
      : []),
  ];

  function handleLogout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-brand-900/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[rgba(8,80,135,0.10)] bg-white transition-transform duration-200 lg:translate-x-0 lg:bg-white/85 lg:backdrop-blur-xl",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-20 items-center justify-between gap-3 border-b border-[rgba(8,80,135,0.10)] px-6">
          <Logo size="md" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition",
                  active
                    ? "bg-brand-700 text-white shadow-[0_12px_28px_rgba(6,59,102,0.30)]"
                    : "text-brand-900/70 hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <Icon size={18} className={cn(active && "text-brand-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[rgba(8,80,135,0.10)] p-3">
          {me.data && (
            <div className="rounded-2xl bg-brand-50/60 px-3 py-2 text-xs">
              <div className="font-bold text-brand-700">{me.data.name}</div>
              <div className="truncate text-brand-700/60">{me.data.email}</div>
            </div>
          )}
          <LangToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-2xl px-4 text-sm font-bold text-brand-900/70 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <LogOut size={18} />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
