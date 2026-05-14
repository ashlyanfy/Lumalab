"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { AdminUser } from "@/lib/types";

export function AssigneeSelect({
  leadId,
  current,
}: {
  leadId: string;
  current: string | null;
}) {
  const { t } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<string>(current ?? "");

  const users = useQuery({
    queryKey: ["users-for-assign"],
    queryFn: () => api<AdminUser[]>("/users"),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: (assigneeId: string) =>
      api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ assigneeId: assigneeId || null }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  function handleChange(value: string) {
    setDraft(value);
    mutation.mutate(value);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        <UserCheck size={12} />
        {t("assignee")}
      </span>
      <select
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        disabled={mutation.isPending || users.isLoading}
        className="h-10 rounded-full border border-[rgba(8,80,135,0.14)] bg-white px-4 text-sm font-bold text-brand-700 transition focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
      >
        <option value="">— {t("unassigned")} —</option>
        {users.data?.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email}
          </option>
        ))}
      </select>
    </div>
  );
}
