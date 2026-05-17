// LumaLab — CMS hydrator.
//
// Loads /pages/public/:slug and patches the landing in-place:
//   • [data-cms-key="title"]          → textContent
//   • [data-cms-list="goodItems"]     → <li> children from string[]
//   • [data-cms-cards="cards"]        → grid rendered via cms-renderers below
//   • <head> SEO meta tags from page.seo
//
// Empty / missing values DON'T touch the DOM (so manual HTML wins).
(function () {
  "use strict";

  const API_BASE = (
    window.LUMALAB_API_BASE || "https://lumalab-backend.up.railway.app/api/v1"
  ).replace(/\/$/, "");

  // ─── helpers ─────────────────────────────────────────────────────────────
  function isMeaningful(v) {
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ─── card renderers per landing grid type ────────────────────────────────
  // Each one accepts the array from CMS, returns an HTML string for innerHTML.
  const renderers = {
    // Plain string list → <li>…</li>
    list(items) {
      return items
        .filter(isMeaningful)
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join("");
    },

    // Hero badges → <span class="badge">…</span>
    badges(items) {
      return items
        .filter(isMeaningful)
        .map((s) => `<span class="badge">${escapeHtml(s)}</span>`)
        .join("");
    },

    // Formula (model) → numbered mini-cards
    formula(items) {
      return items
        .map(
          (it) =>
            `<div class="mini"><span class="num">${escapeHtml(
              it.num ?? "",
            )}</span><strong>${escapeHtml(it.title ?? "")}</strong><span>${escapeHtml(
              it.text ?? "",
            )}</span></div>`,
        )
        .join("");
    },

    // Value / products / expertise / team / safety / proof → glass icon-cards
    iconCards(items) {
      return items
        .map(
          (it) =>
            `<article class="glass"><h3>${escapeHtml(
              it.title ?? "",
            )}</h3><p>${escapeHtml(it.text ?? "")}</p></article>`,
        )
        .join("");
    },

    // Process timeline
    timeline(items) {
      return items
        .map(
          (it, i) =>
            `<div class="t-step"><span class="t-num">${String(i + 1).padStart(
              2,
              "0",
            )}</span><strong>${escapeHtml(it.title ?? "")}</strong><span>${escapeHtml(
              it.text ?? "",
            )}</span></div>`,
        )
        .join("");
    },

    // Cases stats (4 metrics)
    caseStats(items) {
      return items
        .map(
          (it) =>
            `<article class="case-stat"><strong>${escapeHtml(
              it.value ?? "",
            )}</strong><span>${escapeHtml(it.title ?? "")}</span><small>${escapeHtml(
              it.text ?? "",
            )}</small></article>`,
        )
        .join("");
    },

    // Cases method (6 numbered steps)
    caseMethod(items) {
      return items
        .map(
          (it) =>
            `<div class="case-step"><span class="num">${escapeHtml(
              it.num ?? "",
            )}</span><strong>${escapeHtml(it.title ?? "")}</strong><span>${escapeHtml(
              it.text ?? "",
            )}</span></div>`,
        )
        .join("");
    },

    // Filter tags (vacancies)
    filters(items) {
      return items
        .filter(isMeaningful)
        .map(
          (s, i) =>
            `<button type="button" class="filter ${i === 0 ? "active" : ""}" data-filter="${escapeHtml(
              s,
            )}">${escapeHtml(s)}</button>`,
        )
        .join("");
    },
  };

  // ─── apply one block to the DOM ──────────────────────────────────────────
  function applyBlock(pageSlug, block) {
    const roots = document.querySelectorAll(
      `[data-cms-page="${pageSlug}"][data-cms-block="${block.type}"]`,
    );
    if (!roots.length || !block.data || typeof block.data !== "object") return;

    roots.forEach((root) => {
      Object.entries(block.data).forEach(([key, value]) => {
        if (!isMeaningful(value)) return;

        // String / number → textContent on [data-cms-key]
        if (typeof value === "string" || typeof value === "number") {
          const target = root.querySelector(`[data-cms-key="${key}"]`);
          if (target) target.textContent = String(value);
          return;
        }

        // Array → either string list, or array of card-objects
        if (Array.isArray(value)) {
          // String[]: <li> render OR named renderer
          if (value.every((it) => typeof it === "string")) {
            const namedTarget = root.querySelector(`[data-cms-render="${key}"]`);
            if (namedTarget) {
              const r = namedTarget.getAttribute("data-cms-render-as");
              const fn = renderers[r] || renderers.list;
              namedTarget.innerHTML = fn(value);
              return;
            }
            const list = root.querySelector(`[data-cms-list="${key}"]`);
            if (list) {
              list.innerHTML = renderers.list(value);
            }
            return;
          }

          // Array of objects → named renderer
          const cardTarget = root.querySelector(`[data-cms-render="${key}"]`);
          if (cardTarget) {
            const r = cardTarget.getAttribute("data-cms-render-as") || "iconCards";
            const fn = renderers[r] || renderers.iconCards;
            cardTarget.innerHTML = fn(value);
          }
        }
      });
    });
  }

  function applySeo(seo) {
    if (!seo) return;
    if (isMeaningful(seo.title)) document.title = seo.title;
    const setMeta = (selector, content) => {
      if (!isMeaningful(content)) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const parts = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (parts) el.setAttribute(parts[1], parts[2]);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[name="keywords"]', seo.keywords);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[property="og:image"]', seo.ogImage);
  }

  async function fetchPage(slug) {
    try {
      const res = await fetch(
        `${API_BASE}/pages/public/${encodeURIComponent(slug)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function hydratePage(slug) {
    const page = await fetchPage(slug);
    if (!page) return;
    applySeo(page.seo);
    (page.blocks || []).forEach((block) => applyBlock(slug, block));
    // Tell app.js that CMS is done, in case it wants to re-bind filters etc.
    document.dispatchEvent(new CustomEvent("lumalab:cms-applied"));
  }

  function init() {
    const slugs = new Set();
    document.querySelectorAll("[data-cms-page]").forEach((el) => {
      const s = el.getAttribute("data-cms-page");
      if (s) slugs.add(s);
    });
    if (slugs.size === 0) return;
    slugs.forEach(hydratePage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
