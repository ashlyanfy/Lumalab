// LumaLab — CMS hydrator.
// Reads /pages/public/:slug from backend and overrides text/lists in the DOM.
//
// Rules:
//   - <... data-cms-page="home" data-cms-block="hero"> marks a block root.
//   - inside that root, [data-cms-key="title"] gets its textContent replaced.
//   - inside that root, [data-cms-list="items"] gets its <li> children replaced
//     from a string[] array.
//   - if CMS value is null / undefined / empty string / empty array — the DOM
//     is left as-is (no clearing). Single source of truth: if you want it
//     empty on the site, leave the field empty in admin AND clear the HTML.
//   - SEO meta tags also updated from page.seo when non-empty.
(function () {
  "use strict";

  const API_BASE = (
    window.LUMALAB_API_BASE || "https://lumalab-backend.up.railway.app/api/v1"
  ).replace(/\/$/, "");

  function isMeaningful(v) {
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
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

        // Array of strings → replace <ul>/<ol> children on [data-cms-list]
        if (Array.isArray(value) && value.every((it) => typeof it === "string")) {
          const list = root.querySelector(`[data-cms-list="${key}"]`);
          if (list) {
            list.innerHTML = "";
            value.forEach((it) => {
              if (!isMeaningful(it)) return;
              const li = document.createElement("li");
              li.textContent = it;
              list.appendChild(li);
            });
          }
          return;
        }

        // (Cards / nested objects — reserved for app.js integration later.)
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

  async function hydratePage(slug) {
    const page = await fetchPage(slug);
    if (!page) return;
    applySeo(page.seo);
    (page.blocks || []).forEach((block) => applyBlock(slug, block));
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
