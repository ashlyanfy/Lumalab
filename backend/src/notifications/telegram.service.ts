import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lead } from '@prisma/client';

function escapeHtml(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clip(s: string, max = 800): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '…';
}

interface FieldDef {
  key: string;
  icon: string;
  label: string;
}

// All fields we want to surface for each lead kind, in display order.
// Top-level fields are read from `lead`; everything else from `lead.data`.
const COMPANY_BLOCKS: { title: string; fields: FieldDef[] }[] = [
  {
    title: '👤 Контакт',
    fields: [
      { key: '_top:contactName', icon: '👤', label: 'Контактное лицо' },
      { key: 'position', icon: '🪪', label: 'Должность' },
      { key: '_top:email', icon: '📧', label: 'Email' },
      { key: '_top:whatsapp', icon: '📱', label: 'WhatsApp' },
      { key: 'decision_owner', icon: '🗝️', label: 'Кто принимает решение' },
    ],
  },
  {
    title: '🏢 Компания',
    fields: [
      { key: '_top:companyName', icon: '🏢', label: 'Компания' },
      { key: '_top:companySite', icon: '🔗', label: 'Сайт' },
      { key: 'company_size', icon: '👥', label: 'Размер' },
      { key: '_top:industry', icon: '🏷️', label: 'Отрасль' },
      { key: 'market', icon: '🌍', label: 'Рынок / страна' },
    ],
  },
  {
    title: '📦 Продукт',
    fields: [
      { key: 'product_name', icon: '📦', label: 'Продукт' },
      { key: 'product_link', icon: '🔗', label: 'Ссылка' },
      { key: '_top:stage', icon: '📊', label: 'Стадия' },
      { key: 'active_users', icon: '👤', label: 'Активные юзеры' },
      { key: 'revenue_range', icon: '💵', label: 'Выручка' },
      { key: 'product_team', icon: '🧑‍🤝‍🧑', label: 'Команда продукта' },
      { key: 'analytics', icon: '📈', label: 'Аналитика' },
      { key: 'crm', icon: '🗂️', label: 'CRM' },
    ],
  },
  {
    title: '🚀 Рост',
    fields: [
      { key: 'metrics', icon: '🎯', label: 'Метрики для усиления' },
      { key: 'growth_problem', icon: '🧗', label: 'Точка роста / ограничение' },
      { key: 'connected_systems', icon: '🔌', label: 'Подключённые системы' },
      { key: 'data_after_nda', icon: '🔒', label: 'Данные после NDA' },
      { key: 'result_90_days', icon: '⏱️', label: 'Результат за 90 дней' },
      { key: 'help_area', icon: '🆘', label: 'Где нужна помощь' },
    ],
  },
  {
    title: '🤝 Партнёрство',
    fields: [
      { key: '_top:equityReady', icon: '💼', label: 'Equity' },
      { key: 'legal_ready', icon: '⚖️', label: 'Юр. готовность' },
    ],
  },
];

const TALENT_BLOCKS: { title: string; fields: FieldDef[] }[] = [
  {
    title: '👤 Контакт',
    fields: [
      { key: '_top:contactName', icon: '👤', label: 'Имя' },
      { key: '_top:email', icon: '📧', label: 'Email' },
      { key: '_top:whatsapp', icon: '📱', label: 'WhatsApp' },
      { key: '_top:country', icon: '🌍', label: 'Страна / город' },
      { key: 'timezone', icon: '🕒', label: 'Часовой пояс' },
    ],
  },
  {
    title: '💼 Профиль',
    fields: [
      { key: '_top:desiredRole', icon: '🎯', label: 'Роль' },
      { key: 'specialization', icon: '🧬', label: 'Специализация' },
      { key: 'experience', icon: '📚', label: 'Опыт' },
      { key: '_top:workFormat', icon: '⏰', label: 'Формат' },
      { key: 'start_date', icon: '📅', label: 'Готовность начать' },
      { key: 'payment_format', icon: '💵', label: 'Оплата' },
    ],
  },
  {
    title: '🛠️ Навыки',
    fields: [
      { key: 'skills', icon: '🧠', label: 'Стек' },
      { key: 'ai_tools', icon: '🤖', label: 'AI-инструменты' },
      { key: 'data_tools', icon: '📊', label: 'Данные / BI / CRM' },
      { key: 'enterprise_exp', icon: '🏢', label: 'Опыт с крупными' },
    ],
  },
  {
    title: '🔗 Ссылки',
    fields: [
      { key: 'portfolio', icon: '🌐', label: 'Портфолио' },
      { key: 'github', icon: '💻', label: 'GitHub' },
      { key: 'linkedin', icon: '💼', label: 'LinkedIn' },
    ],
  },
  {
    title: '🏆 Кейсы',
    fields: [
      { key: 'best_projects', icon: '⭐', label: '2–3 лучших проекта' },
      { key: 'measurable_result', icon: '📈', label: 'Что сделал, какой результат' },
      { key: 'public_show', icon: '👀', label: 'Можно показать публично' },
      { key: 'nda_show', icon: '🔒', label: 'Только после NDA' },
    ],
  },
  {
    title: '🤝 Готовность',
    fields: [
      { key: 'nda_ready', icon: '✍️', label: 'NDA' },
      { key: '_top:equityReady', icon: '💼', label: 'Equity (top-level)' },
      { key: 'equity_interest', icon: '💼', label: 'Equity (форма)' },
      { key: 'test_ready', icon: '🧪', label: 'Тестовая задача' },
      { key: 'growth_logic', icon: '🧗', label: 'Как ищет точку роста' },
      { key: 'no_task_case', icon: '🧭', label: 'Задача без ТЗ' },
      { key: 'why_lumalab', icon: '💡', label: 'Почему LumaLab' },
    ],
  },
];

function valueOf(lead: Lead, key: string): string | null {
  if (key.startsWith('_top:')) {
    const top = key.slice(5) as keyof Lead;
    const v = lead[top];
    return v == null || v === '' ? null : String(v);
  }
  const data = (lead.data ?? {}) as Record<string, unknown>;
  const v = data[key];
  if (v === null || v === undefined || v === '') return null;
  return String(v);
}

function renderBlock(
  lead: Lead,
  block: { title: string; fields: FieldDef[] },
): string | null {
  const lines: string[] = [];
  for (const f of block.fields) {
    const v = valueOf(lead, f.key);
    if (!v) continue;
    const safe = escapeHtml(clip(v, 400));
    lines.push(`${f.icon} <b>${escapeHtml(f.label)}:</b> ${safe}`);
  }
  if (lines.length === 0) return null;
  return `<b>${escapeHtml(block.title)}</b>\n${lines.join('\n')}`;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private token: string | null = null;
  private chatId: string | null = null;
  private adminBase: string;

  constructor(private readonly config: ConfigService) {
    this.adminBase = config.get<string>('ADMIN_BASE_URL') ?? '';
  }

  onModuleInit() {
    this.token = this.config.get<string>('TELEGRAM_BOT_TOKEN') ?? null;
    this.chatId = this.config.get<string>('TELEGRAM_CHAT_ID') ?? null;
    if (!this.token || !this.chatId) {
      const missing: string[] = [];
      if (!this.token) missing.push('TELEGRAM_BOT_TOKEN');
      if (!this.chatId) missing.push('TELEGRAM_CHAT_ID');
      this.logger.warn(`Telegram disabled — missing env: ${missing.join(', ')}`);
    } else {
      this.logger.log('Telegram configured');
    }
  }

  isEnabled(): boolean {
    return Boolean(this.token && this.chatId);
  }

  async sendNewLead(lead: Lead): Promise<void> {
    if (!this.isEnabled()) return;

    const isCompany = lead.kind === 'COMPANY';
    const blocks = isCompany ? COMPANY_BLOCKS : TALENT_BLOCKS;
    const headIcon = isCompany ? '🏢' : '👤';
    const headLabel = isCompany ? 'Заявка компании' : 'Анкета специалиста';

    const parts: string[] = [];
    parts.push(`${headIcon} <b>${escapeHtml(headLabel)}</b>`);
    parts.push(
      `🆔 <code>${escapeHtml(lead.id)}</code> · 📅 ${escapeHtml(
        new Date(lead.createdAt).toISOString().replace('T', ' ').slice(0, 16),
      )} UTC`,
    );
    parts.push('');

    for (const b of blocks) {
      const rendered = renderBlock(lead, b);
      if (rendered) {
        parts.push(rendered);
        parts.push('');
      }
    }

    if (lead.comment) {
      parts.push(`💬 <b>Комментарий</b>\n<i>${escapeHtml(clip(lead.comment, 600))}</i>`);
      parts.push('');
    }

    if (this.adminBase) {
      parts.push(
        `🔗 <a href="${escapeHtml(this.adminBase)}/leads/${escapeHtml(
          lead.id,
        )}">Открыть в админ-панели</a>`,
      );
    }

    const text = parts.join('\n').slice(0, 4090); // Telegram hard limit 4096

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram sendMessage ${res.status}: ${body}`);
    }
  }
}
