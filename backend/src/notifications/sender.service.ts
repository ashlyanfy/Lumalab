import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lead } from '@prisma/client';

// Sender.net — синхронизация лидов в списки рассылки.
// Каждый новый лид добавляется как подписчик через Sender API v2,
// чтобы потом делать email-кампании из панели app.sender.net.
//
// Env:
//   SENDER_API_TOKEN         — API token (Sender → Settings → API access tokens)
//   SENDER_GROUP_COMPANY     — id группы для лидов-компаний (опционально)
//   SENDER_GROUP_TALENT      — id группы для лидов-специалистов (опционально)
//   SENDER_GROUP_ID          — общая группа, если деление не нужно (опционально)
// Без токена сервис молча выключен — заявки работают как раньше.
@Injectable()
export class SenderService implements OnModuleInit {
  private readonly logger = new Logger(SenderService.name);
  private token = '';
  private groupCompany = '';
  private groupTalent = '';
  private groupDefault = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.token = this.config.get<string>('SENDER_API_TOKEN') ?? '';
    this.groupCompany = this.config.get<string>('SENDER_GROUP_COMPANY') ?? '';
    this.groupTalent = this.config.get<string>('SENDER_GROUP_TALENT') ?? '';
    this.groupDefault = this.config.get<string>('SENDER_GROUP_ID') ?? '';
    if (this.token) {
      this.logger.log('Sender.net sync enabled');
    } else {
      this.logger.warn('Sender.net sync disabled — SENDER_API_TOKEN not set');
    }
  }

  isEnabled(): boolean {
    return this.token.length > 0;
  }

  /** Добавить лида в Sender как подписчика (идемпотентно: существующий email обновляется). */
  async syncLead(lead: Lead): Promise<void> {
    if (!this.isEnabled() || !lead.email) return;

    const group =
      (lead.kind === 'COMPANY' ? this.groupCompany : this.groupTalent) ||
      this.groupDefault;

    const body: Record<string, unknown> = {
      email: lead.email,
      firstname: lead.contactName || undefined,
      groups: group ? [group] : [],
      fields: {
        // Кастомные поля создаются в Sender → Subscribers → Fields;
        // несуществующие поля Sender просто игнорирует.
        '{$lead_kind}': lead.kind,
        '{$locale}': lead.locale ?? '',
      },
    };
    if (lead.whatsapp) body.phone = lead.whatsapp;

    const res = await fetch('https://api.sender.net/v2/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return;

    // 422 «уже существует» — не ошибка: обновим подписчика PATCH-запросом,
    // чтобы он попал в нужную группу.
    const text = await res.text().catch(() => '');
    if (res.status === 422 && /taken|exist/i.test(text)) {
      const patch = await fetch(
        `https://api.sender.net/v2/subscribers/${encodeURIComponent(lead.email)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ groups: group ? [group] : [] }),
        },
      );
      if (patch.ok) return;
      throw new Error(`Sender PATCH ${patch.status}: ${await patch.text().catch(() => '')}`);
    }

    throw new Error(`Sender ${res.status}: ${text}`);
  }
}
