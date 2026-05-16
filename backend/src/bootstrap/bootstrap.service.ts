import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { HOME_BLOCKS } from './home-blocks.data';

/**
 * Idempotent boot-time seed. Runs on every app start.
 *   - Creates ADMIN user if SEED_ADMIN_EMAIL doesn't exist
 *   - Creates page "home" + 15 default CMS blocks if missing
 * Safe to run repeatedly; never overwrites edited content.
 */
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.ensureAdmin();
    } catch (e) {
      this.logger.error(`admin seed failed: ${String(e)}`);
    }
    try {
      await this.ensureHomePage();
    } catch (e) {
      this.logger.error(`CMS seed failed: ${String(e)}`);
    }
  }

  private async ensureAdmin(): Promise<void> {
    const email =
      this.config.get<string>('SEED_ADMIN_EMAIL') ?? 'admin@lumalab.asia';
    const name =
      this.config.get<string>('SEED_ADMIN_NAME') ?? 'LumaLab Admin';
    const explicit = this.config.get<string>('SEED_ADMIN_PASSWORD');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      this.logger.log(`admin user OK: ${email}`);
      return;
    }

    const password =
      explicit && explicit.length >= 8
        ? explicit
        : randomBytes(12).toString('base64url') + 'A1!';
    const hash = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: { email, name, password: hash, role: Role.ADMIN },
    });

    this.logger.log('====================================================');
    this.logger.log(`LumaLab admin created`);
    this.logger.log(`  email:    ${email}`);
    this.logger.log(`  password: ${password}`);
    if (!explicit) {
      this.logger.log(`  (random — store it now; it will not be shown again)`);
    }
    this.logger.log('====================================================');
  }

  private async ensureHomePage(): Promise<void> {
    const slug = 'home';
    const page = await this.prisma.page.upsert({
      where: { slug },
      create: { slug, title: 'LumaLab — главная' },
      update: {},
    });

    await this.prisma.seo.upsert({
      where: { pageId: page.id },
      create: {
        pageId: page.id,
        title: 'LumaLab | Equity Growth Partner',
        description:
          'LumaLab усиливает действующие цифровые продукты крупных компаний через AI, данные, продуктовую стратегию, NDA-процесс и партнёрскую модель роста.',
        keywords: 'lumalab, growth partner, equity, AI, продуктовый рост',
        ogImage: '/assets/image.jpg',
      },
      update: {},
    });

    const existing = await this.prisma.block.findMany({
      where: { pageId: page.id },
      select: { type: true },
    });
    const have = new Set(existing.map((b) => b.type));

    let maxOrder =
      (await this.prisma.block.aggregate({
        where: { pageId: page.id },
        _max: { order: true },
      }))._max.order ?? -1;

    let created = 0;
    for (const block of HOME_BLOCKS) {
      if (have.has(block.type)) continue;
      maxOrder += 1;
      await this.prisma.block.create({
        data: {
          pageId: page.id,
          type: block.type,
          order: maxOrder,
          enabled: true,
          data: block.data as Prisma.InputJsonValue,
        },
      });
      created += 1;
    }

    if (created > 0) {
      this.logger.log(`CMS: seeded ${created} new blocks on /${slug}`);
    } else {
      this.logger.log(`CMS: /${slug} blocks OK (${have.size} present)`);
    }
  }
}
