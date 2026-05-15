import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Lead } from '@prisma/client';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private enabled = false;
  private publicKey = '';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const pub = this.config.get<string>('VAPID_PUBLIC_KEY');
    const priv = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subj = this.config.get<string>('VAPID_SUBJECT');
    if (!pub || !priv || !subj) {
      const missing: string[] = [];
      if (!pub) missing.push('VAPID_PUBLIC_KEY');
      if (!priv) missing.push('VAPID_PRIVATE_KEY');
      if (!subj) missing.push('VAPID_SUBJECT');
      this.logger.warn(`Web-push disabled — missing env: ${missing.join(', ')}`);
      return;
    }
    webpush.setVapidDetails(subj, pub, priv);
    this.publicKey = pub;
    this.enabled = true;
    this.logger.log('Web-push configured');
  }

  isEnabled() {
    return this.enabled;
  }

  getPublicKey() {
    return this.publicKey;
  }

  async subscribe(sub: PushSubscriptionPayload, userId?: string) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId,
      },
      update: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId,
      },
    });
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { ok: true };
  }

  async sendToAll(payload: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;
    const subs = await this.prisma.pushSubscription.findMany();
    const body = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            body,
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
            this.logger.log(`Removed stale push subscription ${s.id}`);
          } else {
            this.logger.warn(`Push send failed for ${s.id}: ${String(err)}`);
          }
        }
      }),
    );
  }

  async sendNewLead(lead: Lead): Promise<void> {
    const title =
      lead.kind === 'COMPANY'
        ? `New company: ${lead.companyName ?? lead.contactName}`
        : `New talent: ${lead.desiredRole ?? lead.contactName}`;
    return this.sendToAll({
      title,
      body: `${lead.contactName} · ${lead.email}`,
      url: `/leads/${lead.id}`,
      leadId: lead.id,
    });
  }

  async sendTest(): Promise<void> {
    return this.sendToAll({
      title: 'LumaLab — test notification',
      body: 'If you see this — push works.',
      url: '/main',
    });
  }
}
