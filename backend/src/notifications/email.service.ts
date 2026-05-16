import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lead } from '@prisma/client';
import * as nodemailer from 'nodemailer';

function escapeHtml(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = '';
  private envTo = '';
  private adminBase = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    const portStr = this.config.get<string>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass =
      this.config.get<string>('SMTP_PASSWORD') ?? this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('MAIL_FROM') ?? user ?? '';
    this.envTo = this.config.get<string>('MAIL_TO') ?? '';
    this.adminBase = this.config.get<string>('ADMIN_BASE_URL') ?? '';

    if (!host || !user || !pass) {
      const missing: string[] = [];
      if (!host) missing.push('SMTP_HOST');
      if (!user) missing.push('SMTP_USER');
      if (!pass) missing.push('SMTP_PASSWORD');
      this.logger.warn(`Email disabled — missing env: ${missing.join(', ')}`);
      return;
    }
    const port = Number(portStr ?? 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    this.from = from;
    this.logger.log(`Email configured (${host}:${port}, from=${from})`);
  }

  isEnabled(): boolean {
    return this.transporter !== null;
  }

  /** Send a new-lead notification to one or many recipients (comma-separated override or env). */
  async sendNewLead(lead: Lead, recipientsOverride?: string): Promise<void> {
    if (!this.transporter) return;
    const to = (recipientsOverride && recipientsOverride.trim().length > 0
      ? recipientsOverride
      : this.envTo
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (to.length === 0) {
      this.logger.warn('Email: no recipients configured (MAIL_TO / emailRecipients empty)');
      return;
    }

    const subject =
      lead.kind === 'COMPANY'
        ? `🏢 LumaLab — заявка от ${lead.companyName ?? lead.contactName}`
        : `👤 LumaLab — анкета: ${lead.desiredRole ?? lead.contactName}`;

    const html = this.renderHtml(lead);
    const text = this.renderText(lead);

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }

  private renderHtml(lead: Lead): string {
    const data = (lead.data ?? {}) as Record<string, unknown>;
    const adminLink = this.adminBase
      ? `<p style="margin:24px 0 0"><a href="${escapeHtml(this.adminBase)}/leads/${escapeHtml(lead.id)}" style="background:#075ea8;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Открыть в админ-панели</a></p>`
      : '';

    const row = (label: string, value: unknown) => {
      if (value === null || value === undefined || value === '') return '';
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eef;color:#456;font-weight:bold;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eef;color:#123">${escapeHtml(String(value))}</td></tr>`;
    };

    const rows: string[] = [];
    rows.push(row('Имя', lead.contactName));
    rows.push(row('Email', lead.email));
    rows.push(row('WhatsApp', lead.whatsapp));
    if (lead.kind === 'COMPANY') {
      rows.push(row('Компания', lead.companyName));
      rows.push(row('Сайт', lead.companySite));
      rows.push(row('Отрасль', lead.industry));
      rows.push(row('Стадия', lead.stage));
      rows.push(row('Equity', lead.equityReady));
    } else {
      rows.push(row('Роль', lead.desiredRole));
      rows.push(row('Формат работы', lead.workFormat));
      rows.push(row('Страна', lead.country));
    }
    // Append remaining `data` keys
    for (const [k, v] of Object.entries(data)) {
      rows.push(row(k, v));
    }

    return `
<div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f7fbff">
  <h2 style="color:#063b66;margin:0 0 4px">${escapeHtml(lead.kind === 'COMPANY' ? '🏢 Заявка компании' : '👤 Анкета специалиста')}</h2>
  <p style="color:#456;margin:0 0 20px;font-size:13px">ID: <code>${escapeHtml(lead.id)}</code> · ${escapeHtml(new Date(lead.createdAt).toISOString().slice(0, 16).replace('T', ' '))} UTC</p>
  <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eef">
    ${rows.join('')}
  </table>
  ${lead.comment ? `<div style="margin-top:16px;padding:14px;background:#eef6ff;border-radius:12px;color:#234"><b>Комментарий:</b><br/>${escapeHtml(lead.comment)}</div>` : ''}
  ${adminLink}
</div>`.trim();
  }

  private renderText(lead: Lead): string {
    const data = (lead.data ?? {}) as Record<string, unknown>;
    const lines = [
      lead.kind === 'COMPANY' ? '=== Заявка компании ===' : '=== Анкета специалиста ===',
      `ID: ${lead.id}`,
      `Имя: ${lead.contactName}`,
      `Email: ${lead.email}`,
    ];
    if (lead.whatsapp) lines.push(`WhatsApp: ${lead.whatsapp}`);
    if (lead.kind === 'COMPANY') {
      if (lead.companyName) lines.push(`Компания: ${lead.companyName}`);
      if (lead.companySite) lines.push(`Сайт: ${lead.companySite}`);
      if (lead.industry) lines.push(`Отрасль: ${lead.industry}`);
      if (lead.stage) lines.push(`Стадия: ${lead.stage}`);
    } else {
      if (lead.desiredRole) lines.push(`Роль: ${lead.desiredRole}`);
      if (lead.workFormat) lines.push(`Формат: ${lead.workFormat}`);
      if (lead.country) lines.push(`Страна: ${lead.country}`);
    }
    if (lead.comment) lines.push(`\nКомментарий:\n${lead.comment}`);
    if (Object.keys(data).length) {
      lines.push('\n--- Дополнительно ---');
      for (const [k, v] of Object.entries(data)) lines.push(`${k}: ${String(v)}`);
    }
    if (this.adminBase) {
      lines.push(`\nОткрыть: ${this.adminBase}/leads/${lead.id}`);
    }
    return lines.join('\n');
  }
}
