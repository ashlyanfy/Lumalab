"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useLang, type Lang } from "@/lib/i18n";
import {
  HOME_BLOCKS,
  findSchema,
  type BlockSchema,
  type CardField,
  type Field,
} from "@/lib/cms-schema";
import type { CmsBlock, CmsPage } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

function fieldLabel(field: Field, lang: Lang): string {
  return field.label[lang];
}

// ---- Field renderers ----

function TextField({
  field,
  value,
  onCommit,
  lang,
}: {
  field: Field;
  value: unknown;
  onCommit: (next: string) => void;
  lang: Lang;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {fieldLabel(field, lang)}
      </span>
      <Input
        defaultValue={value == null ? "" : String(value)}
        onBlur={(e) => {
          const next = e.target.value;
          if ((value ?? "") !== next) onCommit(next);
        }}
      />
    </label>
  );
}

function TextareaField({
  field,
  value,
  onCommit,
  lang,
}: {
  field: Field;
  value: unknown;
  onCommit: (next: string) => void;
  lang: Lang;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {fieldLabel(field, lang)}
      </span>
      <textarea
        defaultValue={value == null ? "" : String(value)}
        rows={3}
        className="w-full rounded-xl border border-[rgba(8,80,135,0.16)] bg-white/80 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
        onBlur={(e) => {
          const next = e.target.value;
          if ((value ?? "") !== next) onCommit(next);
        }}
      />
    </label>
  );
}

function ListField({
  field,
  value,
  onCommit,
  lang,
}: {
  field: Field;
  value: unknown;
  onCommit: (next: string[]) => void;
  lang: Lang;
}) {
  const items: string[] = Array.isArray(value) ? (value as string[]) : [];

  function update(idx: number, next: string) {
    const copy = items.slice();
    copy[idx] = next;
    onCommit(copy);
  }
  function remove(idx: number) {
    const copy = items.slice();
    copy.splice(idx, 1);
    onCommit(copy);
  }
  function add() {
    onCommit([...items, ""]);
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const copy = items.slice();
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onCommit(copy);
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {fieldLabel(field, lang)}
      </span>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              defaultValue={it}
              onBlur={(e) => {
                if (e.target.value !== it) update(i, e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 disabled:opacity-30"
              aria-label="up"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 disabled:opacity-30"
              aria-label="down"
            >
              <ChevronDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
              aria-label="delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100"
      >
        <Plus size={12} /> {lang === "ru" ? "Добавить" : "Add"}
      </button>
    </div>
  );
}

function CardsField({
  field,
  value,
  onCommit,
  lang,
}: {
  field: CardField;
  value: unknown;
  onCommit: (next: Record<string, string>[]) => void;
  lang: Lang;
}) {
  const items: Record<string, string>[] = Array.isArray(value)
    ? (value as Record<string, string>[])
    : [];

  function updateItem(idx: number, key: string, val: string) {
    const copy = items.slice();
    copy[idx] = { ...copy[idx], [key]: val };
    onCommit(copy);
  }
  function remove(idx: number) {
    const copy = items.slice();
    copy.splice(idx, 1);
    onCommit(copy);
  }
  function add() {
    const empty: Record<string, string> = {};
    field.itemFields.forEach((f) => (empty[f.key] = ""));
    onCommit([...items, empty]);
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const copy = items.slice();
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onCommit(copy);
  }

  return (
    <div className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {fieldLabel(field, lang)}
      </span>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[rgba(8,80,135,0.10)] bg-brand-50/30 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/50">
                #{i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-brand-700/60 hover:bg-white disabled:opacity-30"
                  aria-label="up"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-brand-700/60 hover:bg-white disabled:opacity-30"
                  aria-label="down"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-white"
                  aria-label="delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {field.itemFields.map((f) => (
                <label key={f.key} className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/50">
                    {f.label[lang]}
                  </span>
                  {f.type === "textarea" ? (
                    <textarea
                      defaultValue={it[f.key] ?? ""}
                      rows={2}
                      className="w-full rounded-xl border border-[rgba(8,80,135,0.16)] bg-white px-3 py-2 text-sm text-brand-900 focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15"
                      onBlur={(e) => {
                        if ((it[f.key] ?? "") !== e.target.value)
                          updateItem(i, f.key, e.target.value);
                      }}
                    />
                  ) : (
                    <Input
                      defaultValue={it[f.key] ?? ""}
                      onBlur={(e) => {
                        if ((it[f.key] ?? "") !== e.target.value)
                          updateItem(i, f.key, e.target.value);
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-100"
      >
        <Plus size={12} /> {lang === "ru" ? "Добавить карточку" : "Add card"}
      </button>
    </div>
  );
}

// ---- Block card ----

interface BlockCardProps {
  slug: string;
  block: CmsBlock;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (dir: -1 | 1) => void;
}

function BlockCard({ slug, block, canMoveUp, canMoveDown, onMove }: BlockCardProps) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [enabled, setEnabled] = useState(block.enabled);
  const [data, setData] = useState<Record<string, unknown>>(block.data);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setEnabled(block.enabled);
    setData(block.data);
  }, [block.id, block.enabled, block.data]);

  const schema = findSchema(block.type);

  const update = useMutation({
    mutationFn: (payload: Partial<{ enabled: boolean; data: Record<string, unknown> }>) =>
      api(`/blocks/${block.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
      qc.invalidateQueries({ queryKey: ["cms-page", slug] });
    },
  });

  const del = useMutation({
    mutationFn: () => api(`/blocks/${block.id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-page", slug] }),
  });

  function commitField(key: string, next: unknown) {
    const merged = { ...data, [key]: next };
    setData(merged);
    update.mutate({ data: merged });
  }

  return (
    <div
      className={`rounded-[24px] border border-[rgba(8,80,135,0.10)] bg-white/90 p-5 transition ${
        pulse
          ? "shadow-[0_0_0_4px_rgba(47,168,215,0.30)]"
          : "shadow-[0_12px_28px_rgba(8,80,135,0.08)]"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-[rgba(8,80,135,0.08)] pb-3">
        <span className="inline-flex h-8 items-center rounded-full bg-brand-700 px-3 text-xs font-bold text-white">
          {schema ? schema.label[lang] : block.type}
        </span>
        <span className="text-xs text-brand-700/40">
          {schema ? `${block.type} · #${block.order}` : `#${block.order}`}
        </span>
        <button
          type="button"
          onClick={() => {
            const next = !enabled;
            setEnabled(next);
            update.mutate({ enabled: next });
          }}
          className={`ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${
            enabled
              ? "bg-brand-400/15 text-brand-600"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              enabled ? "bg-brand-400" : "bg-slate-400"
            }`}
          />
          {enabled ? t("enabled") : t("disabled")}
        </button>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          aria-label={t("moveUp")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 disabled:opacity-30"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          aria-label={t("moveDown")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 disabled:opacity-30"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("deleteBlock") + "?")) del.mutate();
          }}
          aria-label={t("deleteBlock")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid gap-4">
        {schema ? (
          schema.fields.map((field) => {
            const val = data[field.key];
            if (field.type === "text")
              return (
                <TextField
                  key={field.key}
                  field={field}
                  value={val}
                  onCommit={(v) => commitField(field.key, v)}
                  lang={lang}
                />
              );
            if (field.type === "textarea")
              return (
                <TextareaField
                  key={field.key}
                  field={field}
                  value={val}
                  onCommit={(v) => commitField(field.key, v)}
                  lang={lang}
                />
              );
            if (field.type === "list")
              return (
                <ListField
                  key={field.key}
                  field={field}
                  value={val}
                  onCommit={(v) => commitField(field.key, v)}
                  lang={lang}
                />
              );
            if (field.type === "cards")
              return (
                <CardsField
                  key={field.key}
                  field={field as CardField}
                  value={val}
                  onCommit={(v) => commitField(field.key, v)}
                  lang={lang}
                />
              );
            return null;
          })
        ) : (
          // Unknown block type — generic key/value editor for string fields
          <>
            {Object.entries(data)
              .filter(([, v]) => typeof v === "string" || v == null)
              .map(([key, value]) => (
                <label key={key} className="grid gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                    {key}
                  </span>
                  <Input
                    defaultValue={value == null ? "" : String(value)}
                    onBlur={(e) => {
                      if (String(value ?? "") !== e.target.value)
                        commitField(key, e.target.value);
                    }}
                  />
                </label>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

// ---- Page editor ----

export function PageEditor({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [pickerType, setPickerType] = useState<string>("");

  const pageQ = useQuery({
    queryKey: ["cms-page", slug],
    queryFn: () => api<CmsPage>(`/pages/${slug}`),
  });

  const reorder = useMutation({
    mutationFn: (items: { id: number; order: number }[]) =>
      api(`/pages/${slug}/blocks/reorder`, {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-page", slug] }),
  });

  const addBlock = useMutation({
    mutationFn: (schema: BlockSchema) =>
      api(`/pages/${slug}/blocks`, {
        method: "POST",
        body: JSON.stringify({
          type: schema.type,
          data: schema.defaults,
        }),
      }),
    onSuccess: () => {
      setPickerType("");
      qc.invalidateQueries({ queryKey: ["cms-page", slug] });
    },
  });

  const usedTypes = useMemo(() => {
    return new Set((pageQ.data?.blocks ?? []).map((b) => b.type));
  }, [pageQ.data]);

  const availableSchemas = useMemo(
    () => HOME_BLOCKS.filter((s) => !usedTypes.has(s.type)),
    [usedTypes],
  );

  if (pageQ.isLoading) {
    return <div className="text-sm text-brand-700/60">{t("loading")}</div>;
  }
  if (!pageQ.data) {
    return <div className="text-sm text-red-600">{t("loadError")}</div>;
  }

  const page = pageQ.data;
  const blocks = (page.blocks ?? []).slice().sort((a, b) => a.order - b.order);

  function move(idx: number, dir: -1 | 1) {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    reorder.mutate(next.map((b, i) => ({ id: b.id, order: i })));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
              /{page.slug}
            </p>
            <h1 className="mt-0.5 text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
              {page.title}
            </h1>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const schema = findSchema(pickerType);
          if (schema) addBlock.mutate(schema);
        }}
        className="mb-6 flex flex-wrap items-end gap-2 rounded-[24px] border border-[rgba(8,80,135,0.10)] bg-white/85 p-4 shadow-[0_12px_28px_rgba(8,80,135,0.06)]"
      >
        <div className="flex flex-1 min-w-[220px] flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
            {t("addBlock")}
          </span>
          <Select value={pickerType} onChange={(e) => setPickerType(e.target.value)}>
            <option value="">— {lang === "ru" ? "выбери тип" : "pick a type"} —</option>
            {availableSchemas.map((s) => (
              <option key={s.type} value={s.type}>
                {s.label[lang]} ({s.type})
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="submit"
          size="md"
          variant="accent"
          disabled={!pickerType || addBlock.isPending}
        >
          <Sparkles size={16} /> {addBlock.isPending ? t("saving") : t("addBlock")}
        </Button>
      </form>

      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-[rgba(8,80,135,0.20)] p-8 text-center text-sm text-brand-700/60">
            {t("noBlocks")}
          </div>
        )}
        {blocks.map((b, i) => (
          <BlockCard
            key={b.id}
            slug={slug}
            block={b}
            canMoveUp={i > 0}
            canMoveDown={i < blocks.length - 1}
            onMove={(dir) => move(i, dir)}
          />
        ))}
      </div>
    </div>
  );
}
