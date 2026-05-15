import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lead } from '@prisma/client';

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    const link = this.adminBase ? `${this.adminBase}/leads/${lead.id}` : null;
    const kindEmoji = lead.kind === 'COMPANY' ? '🏢' : '👤';
    const lines: string[] = [];
    lines.push(`${kindEmoji} <b>New ${escapeHtml(lead.kind)} application</b>`);
    lines.push('');
    lines.push(`<b>Name:</b> ${escapeHtml(lead.contactName)}`);
    lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
    if (lead.whatsapp) lines.push(`<b>WhatsApp:</b> ${escapeHtml(lead.whatsapp)}`);
    if (lead.kind === 'COMPANY') {
      if (lead.companyName) lines.push(`<b>Company:</b> ${escapeHtml(lead.companyName)}`);
      if (lead.industry) lines.push(`<b>Industry:</b> ${escapeHtml(lead.industry)}`);
      if (lead.stage) lines.push(`<b>Stage:</b> ${escapeHtml(lead.stage)}`);
    } else {
      if (lead.desiredRole) lines.push(`<b>Role:</b> ${escapeHtml(lead.desiredRole)}`);
      if (lead.workFormat) lines.push(`<b>Format:</b> ${escapeHtml(lead.workFormat)}`);
      if (lead.country) lines.push(`<b>Country:</b> ${escapeHtml(lead.country)}`);
    }
    if (lead.comment) {
      const trim = lead.comment.length > 400 ? lead.comment.slice(0, 400) + '…' : lead.comment;
      lines.push('');
      lines.push(`<i>${escapeHtml(trim)}</i>`);
    }
    if (link) {
      lines.push('');
      lines.push(`<a href="${link}">Open in admin</a>`);
    }

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: lines.join('\n'),
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
