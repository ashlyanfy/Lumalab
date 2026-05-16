"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
  Smartphone,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

// ---------- Types ----------

interface PublicKeyRes {
  publicKey: string;
  enabled: boolean;
}

type Channel = "off" | "email" | "telegram" | "both";

interface NotificationSettings {
  channel: Channel;
  telegramChatId: string;
  emailRecipients: string;
}

// ---------- Helpers ----------

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

type PushStage =
  | "loading"
  | "unsupported"
  | "denied"
  | "not-configured"
  | "off"
  | "on";

// ---------- Push panel ----------

function PushPanel() {
  const { lang } = useLang();
  const [stage, setStage] = useState<PushStage>("loading");
  const [vapidKey, setVapidKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStage("unsupported");
        return;
      }
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        setStage("unsupported");
        setErr("Web Push требует HTTPS или localhost.");
        return;
      }
      if (Notification.permission === "denied") {
        setStage("denied");
        return;
      }
      try {
        const cfg = await api<PublicKeyRes>("/push/public-key");
        if (!cfg.enabled || !cfg.publicKey) {
          setStage("not-configured");
          return;
        }
        setVapidKey(cfg.publicKey);
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        setStage(sub ? "on" : "off");
      } catch {
        setStage("not-configured");
      }
    })();
  }, []);

  async function enable() {
    setErr(null);
    setStep(null);
    // FIRST: synchronously request permission (preserves user gesture).
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      setErr(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      return;
    }
    if (permission !== "granted") {
      setStage(permission === "denied" ? "denied" : "off");
      if (permission === "default") {
        setErr(lang === "ru" ? "Диалог закрыт без выбора." : "Prompt dismissed.");
      }
      return;
    }
    setBusy(true);
    try {
      setStep(lang === "ru" ? "Регистрируем service worker…" : "Registering service worker…");
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
      if (!reg.active) {
        setStep(lang === "ru" ? "Активируем service worker…" : "Activating service worker…");
        await navigator.serviceWorker.ready;
        reg = (await navigator.serviceWorker.getRegistration()) ?? reg;
      }
      setStep(lang === "ru" ? "Подписываемся…" : "Subscribing…");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(vapidKey),
      });
      setStep(lang === "ru" ? "Сохраняем подписку…" : "Saving subscription…");
      const raw = sub.toJSON();
      await api("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint: raw.endpoint, keys: raw.keys }),
      });
      setStage("on");
      setStep(null);
    } catch (e) {
      console.error("[push] enable failed", e);
      setErr(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      setStep(null);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setErr(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await api("/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setStage("off");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setErr(null);
    try {
      await api("/push/test", { method: "POST" });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_20px_50px_rgba(8,80,135,0.06)] backdrop-blur-xl lg:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
          <Smartphone size={20} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-brand-700">
            {lang === "ru" ? "Push в браузере" : "Browser push notifications"}
          </h3>
          <p className="mt-1 text-sm text-brand-700/60">
            {lang === "ru"
              ? "Получайте уведомления на этом устройстве, даже когда админ-панель закрыта."
              : "Receive alerts on this device, even when the admin panel is closed."}
          </p>
        </div>
      </div>

      {stage === "loading" && (
        <div className="flex items-center gap-2 text-sm text-brand-700/60">
          <Loader2 size={16} className="animate-spin" />
          {lang === "ru" ? "Загрузка…" : "Loading…"}
        </div>
      )}
      {stage === "unsupported" && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {lang === "ru"
            ? "Этот браузер не поддерживает push."
            : "Push notifications are not supported on this browser."}
        </div>
      )}
      {stage === "denied" && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {lang === "ru"
            ? "Уведомления заблокированы. Разрешите их в настройках браузера."
            : "Notifications are blocked. Allow them in browser settings."}
        </div>
      )}
      {stage === "not-configured" && (
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          {lang === "ru"
            ? "VAPID-ключи не настроены на бэкенде."
            : "VAPID keys are not configured on the backend."}
        </div>
      )}

      {(stage === "on" || stage === "off") && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
            {stage === "on" ? (
              <>
                <CheckCircle2 size={18} className="text-green-600" />
                {lang === "ru" ? "Включено на этом устройстве." : "Enabled on this device."}
              </>
            ) : (
              <>
                <BellOff size={18} className="text-brand-700/60" />
                {lang === "ru" ? "Выключено." : "Disabled."}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {stage === "on" ? (
              <>
                <Button onClick={test} variant="secondary" size="sm" disabled={busy}>
                  <Send size={14} /> {lang === "ru" ? "Тест" : "Send test"}
                </Button>
                <Button onClick={disable} variant="ghost" size="sm" disabled={busy}>
                  <BellOff size={14} /> {lang === "ru" ? "Выключить" : "Disable"}
                </Button>
              </>
            ) : (
              <Button onClick={enable} variant="accent" size="sm" disabled={busy}>
                <Bell size={14} /> {lang === "ru" ? "Включить" : "Enable"}
              </Button>
            )}
          </div>
        </div>
      )}

      {busy && step && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-700">
          <Loader2 size={12} className="animate-spin" />
          {step}
        </div>
      )}
      {err && (
        <div className="mt-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-700 whitespace-pre-wrap">
          {err}
        </div>
      )}
    </div>
  );
}

// ---------- Channel panel ----------

interface ChannelOption {
  value: Channel;
  label: { en: string; ru: string };
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CHANNELS: ChannelOption[] = [
  { value: "off", label: { en: "Off", ru: "Выключено" }, Icon: BellOff },
  { value: "email", label: { en: "Email", ru: "Email" }, Icon: Mail },
  { value: "telegram", label: { en: "Telegram", ru: "Telegram" }, Icon: Send },
  { value: "both", label: { en: "Email + Telegram", ru: "Email + Telegram" }, Icon: Bell },
];

function ChannelPanel() {
  const { lang } = useLang();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: () => api<NotificationSettings>("/settings/notifications"),
  });

  const [channel, setChannel] = useState<Channel>("off");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (q.data) {
      setChannel(q.data.channel);
      setTelegramChatId(q.data.telegramChatId);
      setEmailRecipients(q.data.emailRecipients);
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: (payload: NotificationSettings) =>
      api<NotificationSettings>("/settings/notifications", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["settings", "notifications"], data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    },
  });

  const showEmail = channel === "email" || channel === "both";
  const showTelegram = channel === "telegram" || channel === "both";

  return (
    <div className="rounded-[28px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_20px_50px_rgba(8,80,135,0.06)] backdrop-blur-xl lg:p-7">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
          {lang === "ru" ? "Канал доставки" : "Delivery channel"}
        </p>
        <p className="mt-1 text-sm text-brand-700/60">
          {lang === "ru"
            ? "Куда отправлять уведомления о новых заявках."
            : "Where to send alerts about new leads."}
        </p>
      </div>

      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((opt) => {
          const active = channel === opt.value;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChannel(opt.value)}
              className={
                "group flex h-16 items-center gap-3 rounded-2xl border px-4 text-left transition " +
                (active
                  ? "border-brand-400 bg-gradient-to-br from-brand-400/10 to-brand-50 shadow-[0_10px_24px_rgba(47,168,215,0.15)]"
                  : "border-[rgba(8,80,135,0.10)] bg-white hover:border-brand-300 hover:bg-brand-50/40")
              }
            >
              <div
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition " +
                  (active ? "bg-brand-400 text-white" : "bg-brand-50 text-brand-600")
                }
              >
                <Icon size={18} />
              </div>
              <span
                className={
                  "text-sm font-bold " + (active ? "text-brand-700" : "text-brand-700/70")
                }
              >
                {opt.label[lang]}
              </span>
            </button>
          );
        })}
      </div>

      {showTelegram && (
        <div className="mb-4">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              Telegram chat ID
            </span>
            <Input
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder={lang === "ru" ? "например: 1100636518" : "e.g. 1100636518"}
            />
            <span className="text-xs text-brand-700/55">
              {lang === "ru"
                ? "Куда отправлять сообщения. Оставь пустым — будет использован TELEGRAM_CHAT_ID из env."
                : "Where messages are sent. Leave empty to use TELEGRAM_CHAT_ID from env."}
            </span>
            <span className="rounded-xl bg-brand-50/70 px-3.5 py-2 text-xs text-brand-700">
              {lang === "ru"
                ? "Чтобы узнать chat ID: открой Telegram → найди своего бота → /start → отправь любое сообщение → ID появится в логах бэкенда."
                : "To get chat ID: open Telegram → find your bot → /start → send any message → ID shows in backend logs."}
            </span>
          </label>
        </div>
      )}

      {showEmail && (
        <div className="mb-4">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {lang === "ru" ? "Email-получатели" : "Email recipients"}
            </span>
            <Input
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              placeholder="info@lumalab.asia, partners@lumalab.asia"
            />
            <span className="text-xs text-brand-700/55">
              {lang === "ru"
                ? "Список email через запятую. Оставь пустым — будет использован MAIL_TO из env."
                : "Comma-separated emails. Leave empty to use MAIL_TO from env."}
            </span>
          </label>
        </div>
      )}

      <div className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
        {lang === "ru"
          ? "Токен бота и SMTP-настройки задаются в Railway → backend → Variables (TELEGRAM_BOT_TOKEN, SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM)."
          : "Bot token and SMTP credentials are set in Railway → backend → Variables (TELEGRAM_BOT_TOKEN, SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM)."}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        {savedFlash && (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700">
            <CheckCircle2 size={14} /> {lang === "ru" ? "Сохранено" : "Saved"}
          </span>
        )}
        <Button
          onClick={() =>
            save.mutate({
              channel,
              telegramChatId,
              emailRecipients,
            })
          }
          disabled={save.isPending || q.isLoading}
        >
          {save.isPending
            ? lang === "ru"
              ? "Сохраняем…"
              : "Saving…"
            : lang === "ru"
              ? "Сохранить настройки"
              : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function SettingsPage() {
  const { lang, t } = useLang();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex items-center gap-4">
        <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-700">
            {lang === "ru" ? "Уведомления" : "Notifications"}
          </h1>
          <p className="mt-1 text-sm text-brand-700/60">
            {lang === "ru"
              ? "Куда отправлять оповещения о новых заявках."
              : "Where to send alerts about new leads."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <PushPanel />
        <ChannelPanel />
      </div>

      {/* Hide t() unused warning */}
      <span className="hidden">{t("settings")}</span>
    </div>
  );
}
