import { Lead } from '@prisma/client';
import * as ExcelJS from 'exceljs';

function fmt(d: Date | null | undefined): string {
  if (!d) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

export async function buildLeadsXlsx(leads: Lead[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LumaLab CRM';
  wb.created = new Date();

  const ws = wb.addWorksheet('Leads');

  ws.columns = [
    { header: 'ID', key: 'id', width: 14 },
    { header: 'Created', key: 'createdAt', width: 18 },
    { header: 'Kind', key: 'kind', width: 10 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Contact name', key: 'contactName', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'Locale', key: 'locale', width: 8 },
    { header: 'Company', key: 'companyName', width: 24 },
    { header: 'Site', key: 'companySite', width: 28 },
    { header: 'Industry', key: 'industry', width: 18 },
    { header: 'Stage', key: 'stage', width: 12 },
    { header: 'Revenue', key: 'revenueRange', width: 14 },
    { header: 'Equity', key: 'equityReady', width: 12 },
    { header: 'Desired role', key: 'desiredRole', width: 16 },
    { header: 'Work format', key: 'workFormat', width: 14 },
    { header: 'Country', key: 'country', width: 18 },
    { header: 'Comment', key: 'comment', width: 40 },
    { header: 'Data (JSON)', key: 'data', width: 60 },
  ];

  for (const lead of leads) {
    ws.addRow({
      id: lead.id,
      createdAt: fmt(lead.createdAt),
      kind: lead.kind,
      status: lead.status,
      contactName: lead.contactName,
      email: lead.email,
      whatsapp: lead.whatsapp ?? '',
      locale: lead.locale ?? '',
      companyName: lead.companyName ?? '',
      companySite: lead.companySite ?? '',
      industry: lead.industry ?? '',
      stage: lead.stage ?? '',
      revenueRange: lead.revenueRange ?? '',
      equityReady: lead.equityReady ?? '',
      desiredRole: lead.desiredRole ?? '',
      workFormat: lead.workFormat ?? '',
      country: lead.country ?? '',
      comment: lead.comment ?? '',
      data: JSON.stringify(lead.data ?? {}),
    });
  }

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF075EA8' }, // LumaLab primary blue
  };
  ws.getRow(1).alignment = { vertical: 'middle' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ----- Single-lead export: vertical "Field / Value" layout, readable for clients -----

const COMPANY_LABELS: { key: string; label: string }[] = [
  { key: '_top:contactName', label: 'Контактное лицо' },
  { key: 'position', label: 'Должность' },
  { key: '_top:email', label: 'Email' },
  { key: '_top:whatsapp', label: 'WhatsApp' },
  { key: 'decision_owner', label: 'Кто принимает решение' },
  { key: '_top:companyName', label: 'Компания' },
  { key: '_top:companySite', label: 'Сайт' },
  { key: 'company_size', label: 'Размер компании' },
  { key: '_top:industry', label: 'Отрасль' },
  { key: 'market', label: 'Рынок / страна' },
  { key: 'product_name', label: 'Продукт' },
  { key: 'product_link', label: 'Ссылка на продукт' },
  { key: '_top:stage', label: 'Стадия продукта' },
  { key: 'active_users', label: 'Активные пользователи' },
  { key: 'revenue_range', label: 'Выручка' },
  { key: 'product_team', label: 'Команда продукта' },
  { key: 'analytics', label: 'Аналитика' },
  { key: 'crm', label: 'CRM' },
  { key: 'metrics', label: 'Метрики для усиления' },
  { key: 'growth_problem', label: 'Точка роста / ограничение' },
  { key: 'connected_systems', label: 'Подключённые системы' },
  { key: 'data_after_nda', label: 'Данные после NDA' },
  { key: 'result_90_days', label: 'Результат за 90 дней' },
  { key: 'help_area', label: 'Где нужна помощь' },
  { key: '_top:equityReady', label: 'Equity' },
  { key: 'legal_ready', label: 'Юр. готовность' },
];

const TALENT_LABELS: { key: string; label: string }[] = [
  { key: '_top:contactName', label: 'Имя' },
  { key: '_top:email', label: 'Email' },
  { key: '_top:whatsapp', label: 'WhatsApp' },
  { key: '_top:country', label: 'Страна / город' },
  { key: 'timezone', label: 'Часовой пояс' },
  { key: '_top:desiredRole', label: 'Желаемая роль' },
  { key: 'specialization', label: 'Специализация' },
  { key: 'experience', label: 'Опыт' },
  { key: '_top:workFormat', label: 'Формат работы' },
  { key: 'start_date', label: 'Готовность начать' },
  { key: 'payment_format', label: 'Формат оплаты' },
  { key: 'skills', label: 'Стек / навыки' },
  { key: 'ai_tools', label: 'AI-инструменты' },
  { key: 'data_tools', label: 'BI / CRM / аналитика' },
  { key: 'enterprise_exp', label: 'Опыт с крупными' },
  { key: 'portfolio', label: 'Портфолио' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'best_projects', label: 'Лучшие проекты' },
  { key: 'measurable_result', label: 'Что сделал и результат' },
  { key: 'public_show', label: 'Можно показать публично' },
  { key: 'nda_show', label: 'Только после NDA' },
  { key: 'nda_ready', label: 'NDA' },
  { key: '_top:equityReady', label: 'Equity (top)' },
  { key: 'equity_interest', label: 'Equity (форма)' },
  { key: 'test_ready', label: 'Тестовая задача' },
  { key: 'growth_logic', label: 'Как ищет точку роста' },
  { key: 'no_task_case', label: 'Задача без ТЗ' },
  { key: 'why_lumalab', label: 'Почему LumaLab' },
];

function valueOf(lead: Lead, key: string): string {
  if (key.startsWith('_top:')) {
    const top = key.slice(5) as keyof Lead;
    const v = lead[top];
    return v == null || v === '' ? '' : String(v);
  }
  const data = (lead.data ?? {}) as Record<string, unknown>;
  const v = data[key];
  if (v === null || v === undefined || v === '') return '';
  return String(v);
}

export async function buildOneLeadXlsx(lead: Lead): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LumaLab CRM';
  wb.created = new Date();

  const ws = wb.addWorksheet(lead.kind === 'COMPANY' ? 'Company' : 'Talent');
  ws.columns = [
    { key: 'label', width: 36 },
    { key: 'value', width: 76 },
  ];

  // Title row
  const title =
    lead.kind === 'COMPANY' ? '🏢 Заявка компании' : '👤 Анкета специалиста';
  ws.addRow([title, '']);
  ws.mergeCells('A1:B1');
  const titleRow = ws.getRow(1);
  titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF075EA8' },
  };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.height = 32;

  // Metadata header
  ws.addRow(['ID', lead.id]);
  ws.addRow(['Дата', fmt(lead.createdAt)]);
  ws.addRow(['Статус', lead.status]);

  // Spacer
  ws.addRow(['', '']);

  const fields = lead.kind === 'COMPANY' ? COMPANY_LABELS : TALENT_LABELS;
  for (const f of fields) {
    const v = valueOf(lead, f.key);
    if (!v) continue;
    ws.addRow([f.label, v]);
  }

  if (lead.comment) {
    ws.addRow(['', '']);
    ws.addRow(['Комментарий', lead.comment]);
  }

  // Style label column
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.alignment = { vertical: 'top', wrapText: true };
    const labelCell = row.getCell(1);
    if (labelCell.value) {
      labelCell.font = { bold: true, color: { argb: 'FF063B66' } };
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAF4FC' },
      };
    }
    row.getCell(2).alignment = { vertical: 'top', wrapText: true };
  }

  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

