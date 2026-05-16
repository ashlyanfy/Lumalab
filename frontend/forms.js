// LumaLab — Company/Talent forms → backend /api/v1/leads.
// No Netlify fallback: if backend fails, we show an inline error so leads
// are never silently lost.
(function () {
  "use strict";

  const API_BASE = (
    window.LUMALAB_API_BASE || "https://lumalab-backend.up.railway.app/api/v1"
  ).replace(/\/$/, "");

  // Top-level columns the backend expects directly on the Lead row.
  // Everything else is forwarded as nested `data`.
  const COMPANY_TOP = {
    company_name: "companyName",
    company_site: "companySite",
    industry: "industry",
    stage: "stage",
    equity_ready: "equityReady",
    contact_person: "contactName",
    whatsapp: "whatsapp",
    email: "email",
    comment: "comment",
  };
  const TALENT_TOP = {
    name: "contactName",
    specialization: "desiredRole",
    work_format: "workFormat",
    country_city: "country",
    whatsapp: "whatsapp",
    email: "email",
    comment: "comment",
  };

  function collect(form, topMap) {
    const fd = new FormData(form);
    const top = {};
    const data = {};
    fd.forEach((value, key) => {
      if (key === "form-name" || key === "bot-field") return;
      const v = typeof value === "string" ? value.trim() : value;
      if (v === "" || v === null || v === undefined) return;
      if (topMap[key]) top[topMap[key]] = v;
      else data[key] = v;
    });
    return { top, data, honeypot: fd.get("bot-field") || "" };
  }

  function detectLocale() {
    return (document.documentElement.lang || "ru").slice(0, 2).toLowerCase();
  }

  async function submitToBackend(kind, form, topMap) {
    const { top, data, honeypot } = collect(form, topMap);
    const payload = {
      kind,
      contactName: top.contactName || "",
      email: top.email || "",
      whatsapp: top.whatsapp,
      comment: top.comment,
      locale: detectLocale(),
      botField: honeypot || undefined,
      companyName: top.companyName,
      companySite: top.companySite,
      industry: top.industry,
      stage: top.stage,
      equityReady: top.equityReady,
      desiredRole: top.desiredRole,
      workFormat: top.workFormat,
      country: top.country,
      data,
    };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === "") delete payload[k];
    });

    const res = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let detail = "";
      try {
        const j = await res.json();
        detail = Array.isArray(j.message) ? j.message.join(", ") : j.message ?? "";
      } catch {
        detail = await res.text().catch(() => "");
      }
      throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
    }
    return res.json();
  }

  function setSubmitting(form, busy) {
    const btn = form.querySelector("button[type=submit], .form-submit");
    if (btn) {
      btn.disabled = busy;
      btn.style.opacity = busy ? "0.6" : "";
      btn.style.cursor = busy ? "wait" : "";
    }
  }

  function showError(form, message) {
    let box = form.querySelector(".form-error");
    if (!box) {
      box = document.createElement("div");
      box.className = "form-error";
      box.style.cssText =
        "margin-top:14px;padding:12px 16px;border-radius:12px;background:#fee;color:#9b1c1c;font-size:13px;font-weight:500;line-height:1.45";
      form.appendChild(box);
    }
    box.textContent = message;
  }

  function clearError(form) {
    const box = form.querySelector(".form-error");
    if (box) box.remove();
  }

  function intercept(formId, kind, topMap) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Defang Netlify-era attributes so a failed submit can't POST to /thank-you.html
    form.removeAttribute("action");
    form.removeAttribute("method");
    form.removeAttribute("data-netlify");
    form.removeAttribute("netlify-honeypot");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearError(form);
      setSubmitting(form, true);
      try {
        await submitToBackend(kind, form, topMap);
        window.location.href = "/thank-you.html";
      } catch (err) {
        console.error("[lumalab] submit failed:", err);
        const lang = (document.documentElement.lang || "ru").toLowerCase();
        const msg =
          lang.startsWith("en")
            ? "Something went wrong. Please try again in a minute or write to info@lumalab.asia."
            : "Что-то пошло не так. Попробуйте через минуту или напишите на info@lumalab.asia.";
        showError(form, msg);
      } finally {
        setSubmitting(form, false);
      }
    });
  }

  function init() {
    intercept("companyForm", "COMPANY", COMPANY_TOP);
    intercept("talentForm", "TALENT", TALENT_TOP);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
