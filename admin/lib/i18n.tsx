"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ru";

const dict = {
  appName: { en: "LumaLab Admin", ru: "LumaLab Админ" },

  login: { en: "Sign in", ru: "Вход" },
  email: { en: "Email", ru: "Email" },
  password: { en: "Password", ru: "Пароль" },
  signIn: { en: "Sign in", ru: "Войти" },
  signingIn: { en: "Signing in…", ru: "Входим…" },
  loginError: { en: "Invalid email or password", ru: "Неверный email или пароль" },
  signOut: { en: "Sign out", ru: "Выйти" },

  navDashboard: { en: "Dashboard", ru: "Главная" },
  navLeads: { en: "Applications", ru: "Заявки" },
  navPages: { en: "Site content", ru: "Контент сайта" },
  navSeo: { en: "SEO", ru: "SEO" },
  navUsers: { en: "Users", ru: "Пользователи" },
  navSettings: { en: "Settings", ru: "Настройки" },

  leads: { en: "Applications", ru: "Заявки" },
  leadsSubtitle: {
    en: "Inbound applications from the LumaLab landing page.",
    ru: "Заявки с лендинга LumaLab.",
  },
  search: {
    en: "Search by name, email, company, role…",
    ru: "Поиск по имени, email, компании, роли…",
  },
  filterKind: { en: "Type", ru: "Тип" },
  filterStatus: { en: "Status", ru: "Статус" },
  filterAll: { en: "All", ru: "Все" },
  fromDate: { en: "From", ru: "С" },
  toDate: { en: "To", ru: "По" },
  pickFromDate: { en: "Pick start date", ru: "Выбрать дату с" },
  pickToDate: { en: "Pick end date", ru: "Выбрать дату по" },
  refresh: { en: "Refresh", ru: "Обновить" },
  exportExcel: { en: "Export to Excel", ru: "Экспорт в Excel" },
  exportHint: {
    en: "Pick a date range and optional filters.",
    ru: "Выбери диапазон дат и фильтры.",
  },
  exportQuick: { en: "Quick range", ru: "Быстрый период" },
  exportLastN: { en: "Last {n} days", ru: "{n} дней" },
  exportAllTime: { en: "All time", ru: "Всё время" },
  resetFilters: { en: "Reset", ru: "Сбросить" },

  kind_COMPANY: { en: "Company", ru: "Компания" },
  kind_TALENT: { en: "Talent", ru: "Специалист" },

  colNumber: { en: "#", ru: "№" },
  colDate: { en: "Date", ru: "Дата" },
  colKind: { en: "Type", ru: "Тип" },
  colContact: { en: "Contact", ru: "Контакт" },
  colCompanyOrRole: { en: "Company / Role", ru: "Компания / Роль" },
  colEmail: { en: "Email", ru: "Email" },
  colStatus: { en: "Status", ru: "Статус" },
  colActions: { en: "Actions", ru: "Действия" },
  open: { en: "Open", ru: "Открыть" },

  status_NEW: { en: "New", ru: "Новая" },
  status_IN_PROGRESS: { en: "In progress", ru: "В работе" },
  status_CONTACTED: { en: "Contacted", ru: "Связались" },
  status_NDA_SIGNED: { en: "NDA signed", ru: "NDA подписано" },
  status_PILOT: { en: "Pilot", ru: "Пилот" },
  status_PARTNERSHIP: { en: "Partnership", ru: "Партнёрство" },
  status_REJECTED: { en: "Rejected", ru: "Отказ" },
  status_ARCHIVED: { en: "Archived", ru: "В архиве" },

  noLeads: { en: "No applications found.", ru: "Заявок не найдено." },
  loading: { en: "Loading…", ru: "Загрузка…" },
  loadError: { en: "Failed to load data.", ru: "Не удалось загрузить данные." },
  total: { en: "Total", ru: "Всего" },
  page: { en: "Page", ru: "Страница" },
  prev: { en: "Previous", ru: "Назад" },
  next: { en: "Next", ru: "Вперёд" },

  // Lead detail
  back: { en: "Back to list", ru: "Назад к списку" },
  contactInfo: { en: "Contact", ru: "Контакт" },
  companyInfo: { en: "Company / product", ru: "Компания / продукт" },
  talentInfo: { en: "Profile", ru: "Профиль" },
  metricsInfo: { en: "Metrics & growth", ru: "Метрики и рост" },
  readinessInfo: { en: "Readiness", ru: "Готовность" },
  skillsInfo: { en: "Skills & tools", ru: "Навыки и инструменты" },
  casesInfo: { en: "Cases & results", ru: "Кейсы и результаты" },
  termsInfo: { en: "Conditions", ru: "Условия" },
  comment: { en: "Comment", ru: "Комментарий" },
  notes: { en: "Internal notes", ru: "Внутренние заметки" },
  notePlaceholder: {
    en: "Add a note for the team…",
    ru: "Добавь заметку для команды…",
  },
  addNote: { en: "Add note", ru: "Добавить" },
  noNotes: { en: "No notes yet.", ru: "Пока без заметок." },
  assignee: { en: "Assignee", ru: "Ответственный" },
  unassigned: { en: "Unassigned", ru: "Не назначен" },

  // Users
  users: { en: "Users", ru: "Пользователи" },
  usersSubtitle: {
    en: "Team members with access to the admin.",
    ru: "Сотрудники с доступом к админке.",
  },
  addUser: { en: "Add user", ru: "Добавить" },
  editUser: { en: "Edit user", ru: "Редактировать" },
  deleteUser: { en: "Delete", ru: "Удалить" },
  deleteConfirm: { en: "Delete this user?", ru: "Удалить пользователя?" },
  name: { en: "Name", ru: "Имя" },
  role: { en: "Role", ru: "Роль" },
  newPassword: {
    en: "New password (leave empty to keep)",
    ru: "Новый пароль (пусто — не менять)",
  },
  cancel: { en: "Cancel", ru: "Отмена" },
  save: { en: "Save", ru: "Сохранить" },
  saving: { en: "Saving…", ru: "Сохранение…" },
  saved: { en: "Saved", ru: "Сохранено" },
  roleAdmin: { en: "Admin", ru: "Админ" },
  roleManager: { en: "Manager", ru: "Менеджер" },

  // Settings placeholder
  settings: { en: "Settings", ru: "Настройки" },
  settingsSoon: {
    en: "Notifications and integrations will appear here on Day 2.",
    ru: "Уведомления и интеграции появятся здесь на 2 дне.",
  },

  // Dashboard
  dashboard: { en: "Dashboard", ru: "Главная" },
  dashboardSoon: {
    en: "Charts and KPIs will appear here once leads start coming in.",
    ru: "Графики и KPI появятся здесь, когда пойдут заявки.",
  },
  dailyTitle: { en: "Applications — last 14 days", ru: "Заявки — последние 14 дней" },
  dailySubtitle: {
    en: "Inbound submissions per day.",
    ru: "Заявки за день.",
  },
  last7days: { en: "Last 7 days", ru: "За 7 дней" },
  noData: { en: "No data yet.", ru: "Пока нет данных." },

  // Pages / CMS
  pages: { en: "Site content", ru: "Контент сайта" },
  pagesSubtitle: {
    en: "Edit landing-page blocks and SEO.",
    ru: "Редактирование блоков лендинга и SEO.",
  },
  pageSlug: { en: "Slug", ru: "Slug" },
  pageTitle: { en: "Title", ru: "Заголовок" },
  noPages: { en: "No pages yet. Create one to start editing.", ru: "Пока нет страниц. Создай первую." },
  newPage: { en: "New page", ru: "Новая страница" },
  blocks: { en: "Blocks", ru: "Блоки" },
  addBlock: { en: "Add block", ru: "Добавить блок" },
  blockType: { en: "Type", ru: "Тип" },
  enabled: { en: "Enabled", ru: "Включён" },
  disabled: { en: "Disabled", ru: "Выключен" },
  moveUp: { en: "Move up", ru: "Выше" },
  moveDown: { en: "Move down", ru: "Ниже" },
  deleteBlock: { en: "Delete block", ru: "Удалить блок" },
  noBlocks: { en: "No blocks yet.", ru: "Пока нет блоков." },

  // SEO
  seo: { en: "SEO", ru: "SEO" },
  seoSubtitle: {
    en: "Meta tags and Open Graph.",
    ru: "Мета-теги и Open Graph.",
  },
  seoTitle: { en: "Meta title", ru: "Meta title" },
  seoDescription: { en: "Meta description", ru: "Meta description" },
  seoKeywords: { en: "Keywords", ru: "Ключевые слова" },
  seoOgImage: { en: "OG image URL", ru: "OG image URL" },
  preview: { en: "Preview", ru: "Превью" },

  // Settings (push + channels)
  notifications: { en: "Notifications", ru: "Уведомления" },
  pushOn: { en: "Push notifications on", ru: "Push-уведомления включены" },
  pushOff: { en: "Push notifications off", ru: "Push-уведомления выключены" },
  enablePush: { en: "Enable push", ru: "Включить push" },
  disablePush: { en: "Disable push", ru: "Выключить push" },
  testPush: { en: "Send test push", ru: "Отправить тест" },
  pushUnsupported: {
    en: "Push notifications are not supported on this browser.",
    ru: "Push в этом браузере не поддерживается.",
  },
  pushDenied: {
    en: "Notifications are blocked. Allow them in browser settings.",
    ru: "Уведомления заблокированы в браузере.",
  },
  pushNotConfigured: {
    en: "VAPID keys are not configured on the backend.",
    ru: "VAPID-ключи не настроены на бэкенде.",
  },
} as const;

type DictKey = keyof typeof dict;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

const STORAGE_KEY = "lumalab_admin_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem(STORAGE_KEY) as Lang | null)) ||
      null;
    if (saved === "en" || saved === "ru") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: DictKey) => dict[key][lang], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
