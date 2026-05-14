"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { KindBadge, StatusBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
import { AssigneeSelect } from "@/components/assignee-select";
import { NotesPanel } from "@/components/notes-panel";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-brand-700/50">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-brand-900">{value}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_18px_44px_rgba(8,80,135,0.06)] backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-brand-700">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function dataField(data: Record<string, unknown>, key: string): string | null {
  const v = data[key];
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "string") return v;
  return String(v);
}

export function LeadDetail({ id }: { id: string }) {
  const { t, lang } = useLang();

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => api<Lead>(`/leads/${id}`),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-brand-700/60">
        {t("loading")}
      </div>
    );
  }
  if (isError || !lead) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-red-600">
        {t("loadError")}
      </div>
    );
  }

  const data = (lead.data ?? {}) as Record<string, unknown>;
  const whatsappLink = lead.whatsapp
    ? `https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft size={14} /> {t("back")}
      </Link>

      <div className="mt-4 rounded-[30px] border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_18px_44px_rgba(8,80,135,0.08)] backdrop-blur-xl lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={lead.kind} />
              <StatusBadge status={lead.status} />
              <span className="text-xs text-brand-700/50">
                #{lead.id.slice(0, 8)} · {formatDate(lead.createdAt)}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-700 lg:text-4xl">
              {lead.contactName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700"
              >
                <Mail size={14} /> {lead.email}
              </a>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
              {lead.whatsapp && (
                <a
                  href={`tel:${lead.whatsapp}`}
                  className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700"
                >
                  <Phone size={14} /> {lead.whatsapp}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusSelect leadId={lead.id} current={lead.status} />
            <AssigneeSelect leadId={lead.id} current={lead.assigneeId} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title={t("contactInfo")}>
          <Field label={lang === "ru" ? "Имя" : "Name"} value={lead.contactName} />
          <Field label="Email" value={lead.email} />
          <Field label="WhatsApp" value={lead.whatsapp} />
          <Field label={lang === "ru" ? "Язык лендинга" : "Locale"} value={lead.locale?.toUpperCase()} />
        </Card>

        {lead.kind === "COMPANY" ? (
          <>
            <Card title={t("companyInfo")}>
              <Field label={lang === "ru" ? "Компания" : "Company"} value={lead.companyName} />
              <Field label={lang === "ru" ? "Сайт" : "Website"} value={lead.companySite} />
              <Field label={lang === "ru" ? "Индустрия" : "Industry"} value={lead.industry} />
              <Field label={lang === "ru" ? "Стадия" : "Stage"} value={lead.stage} />
              <Field label={lang === "ru" ? "Размер компании" : "Company size"} value={dataField(data, "company_size")} />
              <Field label={lang === "ru" ? "Продукт" : "Product"} value={dataField(data, "product_name")} />
              <Field label={lang === "ru" ? "Ссылка на продукт" : "Product link"} value={dataField(data, "product_link")} />
              <Field label={lang === "ru" ? "Рынок" : "Market"} value={dataField(data, "market")} />
              <Field label={lang === "ru" ? "Активные пользователи" : "Active users"} value={dataField(data, "active_users")} />
              <Field label={lang === "ru" ? "Выручка" : "Revenue"} value={lead.revenueRange} />
              <Field label={lang === "ru" ? "Продуктовая команда" : "Product team"} value={dataField(data, "product_team")} />
              <Field label={lang === "ru" ? "Лицо, принимающее решения" : "Decision owner"} value={dataField(data, "decision_owner")} />
            </Card>

            <Card title={t("metricsInfo")}>
              <Field label="Analytics" value={dataField(data, "analytics")} />
              <Field label="CRM" value={dataField(data, "crm")} />
              <Field label={lang === "ru" ? "Метрики" : "Metrics"} value={dataField(data, "metrics")} />
              <Field label={lang === "ru" ? "Проблема роста" : "Growth problem"} value={dataField(data, "growth_problem")} />
              <Field label={lang === "ru" ? "Подключённые системы" : "Connected systems"} value={dataField(data, "connected_systems")} />
              <Field label={lang === "ru" ? "Что можно показать после NDA" : "After NDA"} value={dataField(data, "data_after_nda")} />
              <Field label={lang === "ru" ? "Желаемый результат за 90 дней" : "90-day goal"} value={dataField(data, "result_90_days")} />
              <Field label={lang === "ru" ? "Где нужна помощь" : "Help area"} value={dataField(data, "help_area")} />
            </Card>

            <Card title={t("readinessInfo")}>
              <Field label={lang === "ru" ? "Готовность к equity" : "Equity ready"} value={lead.equityReady} />
              <Field label={lang === "ru" ? "Юридическая готовность" : "Legal ready"} value={dataField(data, "legal_ready")} />
              <Field label={lang === "ru" ? "Контактное лицо" : "Contact person"} value={dataField(data, "contact_person")} />
              <Field label={lang === "ru" ? "Должность" : "Position"} value={dataField(data, "position")} />
            </Card>
          </>
        ) : (
          <>
            <Card title={t("talentInfo")}>
              <Field label={lang === "ru" ? "Страна / город" : "Country / City"} value={lead.country ?? dataField(data, "country_city")} />
              <Field label="Timezone" value={dataField(data, "timezone")} />
              <Field label={lang === "ru" ? "Роль" : "Desired role"} value={lead.desiredRole} />
              <Field label={lang === "ru" ? "Специализация" : "Specialization"} value={dataField(data, "specialization")} />
              <Field label={lang === "ru" ? "Опыт" : "Experience"} value={dataField(data, "experience")} />
              <Field label={lang === "ru" ? "Формат работы" : "Work format"} value={lead.workFormat} />
              <Field label={lang === "ru" ? "Дата старта" : "Start date"} value={dataField(data, "start_date")} />
            </Card>

            <Card title={t("skillsInfo")}>
              <Field label={lang === "ru" ? "Навыки" : "Skills"} value={dataField(data, "skills")} />
              <Field label="AI tools" value={dataField(data, "ai_tools")} />
              <Field label="Data tools" value={dataField(data, "data_tools")} />
              <Field label={lang === "ru" ? "Опыт с корпорациями" : "Enterprise experience"} value={dataField(data, "enterprise_exp")} />
              <Field label={lang === "ru" ? "Готов к NDA" : "NDA ready"} value={dataField(data, "nda_ready")} />
              <Field label="Portfolio" value={dataField(data, "portfolio")} />
              <Field label="GitHub" value={dataField(data, "github")} />
              <Field label="LinkedIn" value={dataField(data, "linkedin")} />
            </Card>

            <Card title={t("casesInfo")}>
              <Field label={lang === "ru" ? "Лучшие проекты" : "Best projects"} value={dataField(data, "best_projects")} />
              <Field label={lang === "ru" ? "Измеримый результат" : "Measurable result"} value={dataField(data, "measurable_result")} />
              <Field label={lang === "ru" ? "Публично" : "Public"} value={dataField(data, "public_show")} />
              <Field label={lang === "ru" ? "После NDA" : "After NDA"} value={dataField(data, "nda_show")} />
              <Field label={lang === "ru" ? "Логика роста" : "Growth logic"} value={dataField(data, "growth_logic")} />
              <Field label={lang === "ru" ? "Без задачи" : "No-task case"} value={dataField(data, "no_task_case")} />
              <Field label={lang === "ru" ? "Почему LumaLab" : "Why LumaLab"} value={dataField(data, "why_lumalab")} />
            </Card>

            <Card title={t("termsInfo")}>
              <Field label={lang === "ru" ? "Интерес к equity" : "Equity interest"} value={dataField(data, "equity_interest")} />
              <Field label={lang === "ru" ? "Формат оплаты" : "Payment format"} value={dataField(data, "payment_format")} />
              <Field label={lang === "ru" ? "Готов к тестовому" : "Test ready"} value={dataField(data, "test_ready")} />
            </Card>
          </>
        )}

        {lead.comment && (
          <div className="rounded-3xl border border-[rgba(8,80,135,0.08)] bg-white/85 p-6 shadow-[0_18px_44px_rgba(8,80,135,0.06)] backdrop-blur-xl lg:col-span-2">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-brand-700">
              {t("comment")}
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-900">
              {lead.comment}
            </p>
          </div>
        )}

        <div className="lg:col-span-2">
          <NotesPanel leadId={lead.id} notes={lead.notes ?? []} />
        </div>
      </div>
    </div>
  );
}
