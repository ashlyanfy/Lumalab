// LumaLab — connect Company/Talent forms to backend /api/v1/leads.
// Falls back to Netlify submit if backend is unreachable, so we never lose a lead.
(function () {
  "use strict";

  const API_BASE = (window.LUMALAB_API_BASE || "https://lumalab-backend.up.railway.app/api/v1").replace(/\/$/, "");

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
      const body = await res.text().catch(() => "");
      throw new Error(`Backend ${res.status}: ${body || "submission failed"}`);
    }
    return res.json();
  }

  function disableSubmit(form, disabled) {
    const btn = form.querySelector("button[type=submit], .form-submit");
    if (btn) btn.disabled = disabled;
  }

  function intercept(formId, kind, topMap) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      disableSubmit(form, true);
      try {
        await submitToBackend(kind, form, topMap);
        window.location.href = form.getAttribute("action") || "/thank-you.html";
      } catch (err) {
        // Fallback: let Netlify capture so we never silently drop a lead.
        console.warn("[lumalab] backend submit failed, falling back to Netlify:", err);
        form.submit();
      } finally {
        // Re-enable after a tick in case navigation didn't happen.
        setTimeout(() => disableSubmit(form, false), 1500);
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
