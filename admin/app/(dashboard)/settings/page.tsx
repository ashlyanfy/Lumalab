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

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
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
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStage("unsupported");
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
    setBusy(true);
    setMsg(null);
    try {
      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register("/sw.js"));
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStage(permission === "denied" ? "denied" : "off");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const raw = sub.toJSON();
      await api("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: raw.endpoint,
          keys: raw.keys,
        }),
      });
      setStage("on");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
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

        {msg && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-700">{msg}</div>
        )}
      </div>
    </div>
  );
}
