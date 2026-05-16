import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
} from './settings.types';

const KEY_NOTIFICATIONS = 'notifications';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(): Promise<NotificationSettings> {
    const row = await this.prisma.setting.findUnique({
      where: { key: KEY_NOTIFICATIONS },
    });
    if (!row) return DEFAULT_NOTIFICATION_SETTINGS;
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(row.value as Partial<NotificationSettings>),
    };
  }

  async setNotifications(
    next: NotificationSettings,
  ): Promise<NotificationSettings> {
    const clean: NotificationSettings = {
      channel: next.channel,
      telegramChatId: (next.telegramChatId ?? '').trim(),
      emailRecipients: (next.emailRecipients ?? '').trim(),
    };
    await this.prisma.setting.upsert({
      where: { key: KEY_NOTIFICATIONS },
      create: {
        key: KEY_NOTIFICATIONS,
        value: clean as unknown as Prisma.InputJsonValue,
      },
      update: { value: clean as unknown as Prisma.InputJsonValue },
    });
    return clean;
  }
}
