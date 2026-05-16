"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/button";

interface PublicKeyRes {
  publicKey: string;
  enabled: boolean;
}

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

type Stage =
  | "loading"
  | "unsupported"
  | "denied"
  | "not-configured"
  | "off"
  | "on";

export default function SettingsPage() {
  const { t } = useLang();
  const [stage, setStage] = useState<Stage>("loading");
  const [vapidKey, setVapidKey] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStage("unsupported");
        return;
      }
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        setStage("unsupported");
        setMsg("Web Push requires HTTPS or localhost.");
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
      } catch (e) {
        console.error("[push] init failed", e);
        setStage("not-configured");
      }
    })();
  }, []);

  async function enable() {
    setMsg(null);
    setStep(null);

    // CRITICAL: ask permission FIRST, synchronously after click,
    // before any await — otherwise Chrome loses the user-gesture context
    // and delays the prompt for seconds.
    console.log("[push] step 1: requestPermission (must be sync after click)");
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.error("[push] requestPermission failed", e);
      setMsg(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      return;
    }
    console.log("[push] permission:", permission);

    if (permission !== "granted") {
      setStage(permission === "denied" ? "denied" : "off");
      if (permission === "default") {
        setMsg("Вы закрыли диалог не дав разрешение.");
      }
      return;
    }

    // Now the slow async work — permission is granted, we can safely await.
    setBusy(true);
    try {
      setStep("Регистрируем service worker…");
      console.log("[push] step 2: register SW");
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
      }

      setStep("Активируем service worker…");
      console.log("[push] step 3: wait for active SW");
      if (!reg.active) {
        await navigator.serviceWorker.ready;
        reg = (await navigator.serviceWorker.getRegistration()) ?? reg;
      }

      setStep("Подписываемся на push…");
      console.log("[push] step 4: pushManager.subscribe");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(vapidKey),
      });
      console.log("[push] subscription created:", sub.endpoint);

      setStep("Сохраняем подписку на сервере…");
      console.log("[push] step 5: POST /push/subscribe");
      const raw = sub.toJSON();
      await api("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: raw.endpoint,
          keys: raw.keys,
        }),
      });
      console.log("[push] subscription saved to backend");

      setStage("on");
      setStep(null);
    } catch (e) {
      console.error("[push] enable failed", e);
      const errText =
        e instanceof Error
          ? `${e.name}: ${e.message}`
          : typeof e === "string"
            ? e
            : JSON.stringify(e);
      setMsg(errText);
      setStep(null);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMsg(null);
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
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setMsg(null);
    try {
      await api("/push/test", { method: "POST" });
    } catch (e) {
      if (e instanceof ApiError) setMsg(e.message);
      else setMsg(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex items-center gap-4">
        <img src="/lumalab-mark.png" alt="LumaLab" className="h-12 w-auto" draggable={false} />
        <h1 className="text-3xl font-black tracking-tight text-brand-700">
          {t("settings")}
        </h1>
      </div>

      <div className="rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(8,80,135,0.08)] backdrop-blur-xl lg:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-[0_10px_24px_rgba(7,94,168,0.30)]">
            {stage === "on" ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-brand-700">{t("notifications")}</h2>
            <p className="text-xs text-brand-700/60">
              {stage === "on" ? t("pushOn") : t("pushOff")}
            </p>
          </div>
        </div>

        {stage === "loading" && (
          <div className="flex items-center gap-2 text-sm text-brand-700/60">
            <Loader2 size={16} className="animate-spin" /> {t("loading")}
          </div>
        )}
        {stage === "unsupported" && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t("pushUnsupported")}
          </div>
        )}
        {stage === "denied" && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {t("pushDenied")}
          </div>
        )}
        {stage === "not-configured" && (
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            {t("pushNotConfigured")}
          </div>
        )}

        {(stage === "on" || stage === "off") && (
          <div className="flex flex-wrap gap-2">
            {stage === "off" ? (
              <Button onClick={enable} disabled={busy} variant="accent">
                <Bell size={16} /> {busy ? t("loading") : t("enablePush")}
              </Button>
            ) : (
              <>
                <Button onClick={disable} disabled={busy} variant="secondary">
                  <BellOff size={16} /> {busy ? t("loading") : t("disablePush")}
                </Button>
                <Button onClick={test} disabled={busy}>
                  <Send size={16} /> {t("testPush")}
                </Button>
              </>
            )}
          </div>
        )}

        {busy && step && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-xs font-medium text-brand-700">
            <Loader2 size={14} className="animate-spin" />
            {step}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-700 whitespace-pre-wrap">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
