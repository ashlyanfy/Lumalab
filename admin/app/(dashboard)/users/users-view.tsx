"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { AdminUser, Role } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

interface UserDraft {
  id?: string;
  email: string;
  name: string;
  role: Role;
  password: string;
}

const empty: UserDraft = { email: "", name: "", role: "MANAGER", password: "" };

export function UsersView() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; role: Role }>("/auth/me"),
  });

  const list = useQuery({
    queryKey: ["users"],
    queryFn: () => api<AdminUser[]>("/users"),
  });

  const createMutation = useMutation({
    mutationFn: (data: UserDraft) =>
      api("/users", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          role: data.role,
          password: data.password,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setDraft(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserDraft) => {
      const body: Record<string, unknown> = { name: data.name, role: data.role };
      if (data.password) body.password = data.password;
      return api(`/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setDraft(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!draft) return;
    if (draft.id) updateMutation.mutate(draft);
    else createMutation.mutate(draft);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
              {t("users")}
            </h1>
            <p className="mt-1 text-sm text-brand-700/60">{t("usersSubtitle")}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <UserPlus size={14} />
          {t("addUser")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-[rgba(8,80,135,0.08)] bg-white/85 shadow-[0_18px_44px_rgba(8,80,135,0.08)] backdrop-blur-xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-50/60 text-[11px] font-bold uppercase tracking-wider text-brand-700/70">
            <tr>
              <th className="px-4 py-3">{t("name")}</th>
              <th className="px-4 py-3">{t("email")}</th>
              <th className="px-4 py-3">{t("role")}</th>
              <th className="px-4 py-3">{t("colDate")}</th>
              <th className="px-4 py-3 text-right">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(8,80,135,0.06)]">
            {list.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-700/60">
                  {t("loading")}
                </td>
              </tr>
            )}
            {list.data?.map((u) => (
              <tr key={u.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 font-semibold text-brand-900">{u.name}</td>
                <td className="px-4 py-3 text-brand-700/80">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                    {u.role === "ADMIN" ? t("roleAdmin") : t("roleManager")}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-brand-700/60">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: u.id,
                          email: u.email,
                          name: u.name,
                          role: u.role,
                          password: "",
                        })
                      }
                      className="rounded-full p-1.5 text-brand-700/60 hover:bg-brand-50 hover:text-brand-700"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={u.id === me.data?.id}
                      onClick={() => {
                        if (confirm(t("deleteConfirm"))) deleteMutation.mutate(u.id);
                      }}
                      className="rounded-full p-1.5 text-red-600/70 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4"
          onClick={() => setDraft(null)}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-[rgba(8,80,135,0.10)] bg-white p-6 shadow-[0_28px_80px_rgba(8,80,135,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-700">
                {draft.id ? t("editUser") : t("addUser")}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-full p-1.5 text-brand-700/60 hover:bg-brand-50"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  required
                  disabled={!!draft.id}
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t("name")}
                </label>
                <Input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t("role")}
                </label>
                <Select
                  value={draft.role}
                  onChange={(e) =>
                    setDraft({ ...draft, role: e.target.value as Role })
                  }
                >
                  <option value="MANAGER">{t("roleManager")}</option>
                  <option value="ADMIN">{t("roleAdmin")}</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {draft.id ? t("newPassword") : t("password")}
                </label>
                <Input
                  type="password"
                  required={!draft.id}
                  minLength={8}
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDraft(null)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("saving")
                    : t("save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
