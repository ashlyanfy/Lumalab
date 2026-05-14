"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";
import { Button } from "./button";

const STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "NDA_SIGNED",
  "PILOT",
  "PARTNERSHIP",
  "REJECTED",
  "ARCHIVED",
];

export function StatusSelect({
  leadId,
  current,
}: {
  leadId: string;
  current: LeadStatus;
}) {
  const { t } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<LeadStatus>(current);
  const [justSaved, setJustSaved] = useState(false);

  const dirty = draft !== current;

  const mutation = useMutation({
    mutationFn: (status: LeadStatus) =>
      api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1400);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <select
        value={draft}
        onChange={(e) => setDraft(e.target.value as LeadStatus)}
        className="h-10 rounded-full border border-[rgba(8,80,135,0.14)] bg-white px-4 text-sm font-bold text-brand-700 transition focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status_${s}` as const)}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="accent"
        disabled={!dirty || mutation.isPending}
        onClick={() => mutation.mutate(draft)}
        className={cn(dirty && "save-glow", justSaved && "")}
      >
        {justSaved ? (
          <>
            <Check size={14} /> {t("saved")}
          </>
        ) : mutation.isPending ? (
          t("saving")
        ) : (
          t("save")
        )}
      </Button>
    </div>
  );
}
