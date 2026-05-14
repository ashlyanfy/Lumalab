"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
import { DesktopTopbar } from "@/components/desktop-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-64">
        <MobileTopbar onMenu={() => setOpen(true)} />
        <DesktopTopbar />
        <main>{children}</main>
      </div>
    </>
  );
}
