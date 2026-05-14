"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { LeadNote } from "@/lib/types";
import { Button } from "./button";

interface NotesPanelProps {
  leadId: string;
  notes: LeadNote[];
}

export function NotesPanel({ leadId, notes }: NotesPanelProps) {
  const { t } = useLang();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: (text: string) =>
      api<LeadNote>(`/leads/${leadId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: text }),
      }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  }

  return (
    <div className="rounded-3xl border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_18px_44px_rgba(8,80,135,0.06)] backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-brand-700">
        {t("notes")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("notePlaceholder")}
          rows={3}
          className="w-full resize-y rounded-2xl border border-[rgba(8,80,135,0.14)] bg-white/80 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 transition focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="accent"
            disabled={mutation.isPending || !body.trim()}
          >
            <MessageSquarePlus size={14} />
            {t("addNote")}
          </Button>
        </div>
      </form>

      <ul className="mt-6 space-y-3">
        {notes.length === 0 && (
          <li className="text-sm text-slate-500">{t("noNotes")}</li>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            className="rounded-2xl border border-[rgba(8,80,135,0.06)] bg-brand-50/40 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-brand-700">
                {note.author?.name ?? note.author?.email ?? "—"}
              </span>
              <span className="text-xs text-brand-700/50">
                {formatDate(note.createdAt)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-brand-900">
              {note.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
