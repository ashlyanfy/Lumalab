// LumaLab — GA4 analytics module.
// Требует window.LUMALAB_GA_ID = "G-XXXXXXXXXX" (задаётся в index.html до подключения).
// Если ID не задан или оставлен плейсхолдер — модуль молчит и ничего не отправляет.
//
// Схема событий (все имена и параметры — snake_case):
//   cta_click            { button_text, section_id, target_id }
//   nav_click            { link_text, target_id, nav_location }   nav_location: header|bottom_nav|footer
//   external_link_click  { link_url, link_domain, section_id }
//   whatsapp_click       { section_id }
//   email_click          { section_id }
//   language_switch      { language }
//   job_filter_select    { filter_name }
//   form_tab_switch      { form_type }
//   form_start           { form_type }        — первый фокус в поле формы
//   form_submit_attempt  { form_type }
//   form_submit_error    { form_type, error_message }
//   generate_lead        { form_type }        — конверсия, стреляет на /thank-you.html
//   scroll_depth         { percent_scrolled } — 25 / 50 / 75 / 100
//   section_view         { section_id }       — секция реально показана на экране
//   time_on_page         { seconds_on_page }  — при уходе со страницы
(function () {
  "use strict";

  var GA_ID = window.LUMALAB_GA_ID || "";
  if (GA_ID === "G-XXXXXXXXXX" || !/^G-[A-Z0-9]{6,}$/.test(GA_ID)) {
    console.info("[lumalab] GA4 отключён: задай window.LUMALAB_GA_ID в index.html");
    return;
  }

  // Локальный опт-аут для своих тестов: в консоли выполнить
  // localStorage.setItem('lumalab-analytics-off', '1') и обновить страницу.
  try {
    if (localStorage.getItem("lumalab-analytics-off") === "1") return;
  } catch (_) { /* приватный режим — продолжаем */ }

  // ---------- База gtag ----------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag("js", new Date());
  gtag("config", GA_ID, {
    send_page_view: true,
    // язык интерфейса как пользовательское свойство — удобно сегментировать RU/EN
    language: (document.documentElement.lang || "ru").slice(0, 2),
  });

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // ---------- Хелперы ----------
  function currentLang() {
    return (document.documentElement.lang || "ru").slice(0, 2);
  }

  // Общие параметры добавляются к каждому событию.
  function track(name, params) {
    var payload = Object.assign(
      { page_path: location.pathname, page_lang: currentLang() },
      params || {}
    );
    gtag("event", name, payload);
  }

  function sectionOf(el) {
    var sec = el.closest("section[id]");
    if (sec) return sec.id;
    if (el.closest("header")) return "header";
    if (el.closest("footer")) return "footer";
    if (el.closest(".bottom-nav")) return "bottom_nav";
    return "page";
  }

  function textOf(el) {
    return (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100);
  }

  // ---------- Конверсия на /thank-you.html ----------
  // forms.js делает мгновенный redirect после успешной отправки, поэтому
  // сам факт лида фиксируем на странице «Спасибо» через sessionStorage —
  // событие гарантированно доходит и не дублируется при перезагрузке.
  if (location.pathname.indexOf("thank-you") !== -1) {
    var lead = null;
    try {
      lead = sessionStorage.getItem("lumalab-lead");
      sessionStorage.removeItem("lumalab-lead");
    } catch (_) {}
    if (lead) {
      track("generate_lead", { form_type: lead.toLowerCase() });
    }
    return; // на thank-you остальной трекинг (секции, формы) не нужен
  }

  // ---------- Скролл-глубина: 25 / 50 / 75 / 100 ----------
  var scrollMarks = [25, 50, 75, 100];
  var scrollSent = {};
  var scrollTicking = false;

  function checkScroll() {
    scrollTicking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var pct = Math.round(((window.scrollY || doc.scrollTop) / max) * 100);
    for (var i = 0; i < scrollMarks.length; i++) {
      var mark = scrollMarks[i];
      if (pct >= mark && !scrollSent[mark]) {
        scrollSent[mark] = true;
        track("scroll_depth", { percent_scrolled: mark });
      }
    }
  }

  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(checkScroll);
    }
  }, { passive: true });

  // ---------- Просмотры секций ----------
  if ("IntersectionObserver" in window) {
    var seenSections = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (entry.isIntersecting && !seenSections[id]) {
          seenSections[id] = true;
          track("section_view", { section_id: id });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("main section[id]").forEach(function (sec) {
      io.observe(sec);
    });
  }

  // ---------- Клики: один делегированный обработчик ----------
  document.addEventListener("click", function (event) {
    var el = event.target.closest("a, button");
    if (!el) return;

    var section = sectionOf(el);

    // Переключатель языка
    if (el.classList.contains("lang-toggle")) {
      track("language_switch", { language: currentLang() === "ru" ? "en" : "ru" });
      return;
    }

    // Фильтры вакансий
    if (el.closest("#jobFilters")) {
      track("job_filter_select", { filter_name: textOf(el) });
      return;
    }

    // Табы формы «Компания / Специалист»
    if (el.hasAttribute("data-form-tab")) {
      track("form_tab_switch", { form_type: el.getAttribute("data-form-tab") });
      return;
    }

    if (el.tagName !== "A") return;
    var href = el.getAttribute("href") || "";

    // Email
    if (href.indexOf("mailto:") === 0) {
      track("email_click", { section_id: section });
      return;
    }

    // WhatsApp и прочие внешние ссылки
    if (/^https?:\/\//.test(href)) {
      var domain = "";
      try { domain = new URL(href).hostname; } catch (_) {}
      if (domain && domain !== location.hostname) {
        if (domain.indexOf("wa.me") !== -1 || domain.indexOf("whatsapp") !== -1) {
          track("whatsapp_click", { section_id: section });
        } else {
          track("external_link_click", { link_url: href, link_domain: domain, section_id: section });
        }
        return;
      }
    }

    // Внутренние якорные ссылки: CTA или навигация
    if (href.charAt(0) === "#") {
      var isNav = !!el.closest(".desktop-nav, .bottom-nav, .footer");
      if (isNav) {
        var navLocation = el.closest(".desktop-nav") ? "header"
          : el.closest(".bottom-nav") ? "bottom_nav" : "footer";
        track("nav_click", { link_text: textOf(el), target_id: href.slice(1), nav_location: navLocation });
      } else if (el.classList.contains("btn") || el.classList.contains("top-cta") || el.classList.contains("job-link")) {
        track("cta_click", { button_text: textOf(el), section_id: section, target_id: href.slice(1) });
      }
    }
  }, true);

  // ---------- Формы ----------
  var FORM_TYPES = { companyForm: "company", talentForm: "talent" };
  var formStarted = {};

  // form_start — первый фокус в любом поле формы
  document.addEventListener("focusin", function (event) {
    var form = event.target.closest("#companyForm, #talentForm");
    if (!form || formStarted[form.id]) return;
    if (!event.target.matches("input, select, textarea")) return;
    formStarted[form.id] = true;
    track("form_start", { form_type: FORM_TYPES[form.id] });
  });

  // Попытка отправки (валидная — invalid не доходит до submit)
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!FORM_TYPES[form.id]) return;
    track("form_submit_attempt", { form_type: FORM_TYPES[form.id] });
  }, true);

  // Кастомные события из forms.js
  document.addEventListener("lumalab:form-success", function (event) {
    var kind = (event.detail && event.detail.kind) || "unknown";
    // Флаг для generate_lead на /thank-you.html (см. выше)
    try { sessionStorage.setItem("lumalab-lead", kind); } catch (_) {}
  });

  document.addEventListener("lumalab:form-error", function (event) {
    var d = event.detail || {};
    track("form_submit_error", {
      form_type: (d.kind || "unknown").toLowerCase(),
      error_message: String(d.message || "").slice(0, 100),
    });
  });

  // ---------- Время на странице ----------
  var pageOpenedAt = Date.now();
  var timeSent = false;
  function sendTimeOnPage() {
    if (timeSent) return;
    timeSent = true;
    var seconds = Math.round((Date.now() - pageOpenedAt) / 1000);
    if (seconds < 1) return;
    // gtag использует sendBeacon — событие доходит даже при закрытии вкладки
    track("time_on_page", { seconds_on_page: seconds });
  }
  window.addEventListener("pagehide", sendTimeOnPage);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sendTimeOnPage();
  });
})();
