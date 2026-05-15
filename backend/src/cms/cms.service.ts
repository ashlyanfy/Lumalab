import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto, UpdateBlockDto, ReorderBlocksDto } from './dto/upsert-block.dto';
import { UpsertPageDto, UpdatePageDto } from './dto/upsert-page.dto';
import { UpsertSeoDto } from './dto/upsert-seo.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Pages ----
  listPages() {
    return this.prisma.page.findMany({ orderBy: { slug: 'asc' } });
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        seo: true,
      },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async getPublicPage(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { where: { enabled: true }, orderBy: { order: 'asc' } },
        seo: true,
      },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async createPage(dto: UpsertPageDto) {
    return this.prisma.page.create({
      data: { slug: dto.slug, title: dto.title },
    });
  }

  async updatePage(slug: string, dto: UpdatePageDto) {
    await this.getPageBySlug(slug);
    return this.prisma.page.update({
      where: { slug },
      data: { ...(dto.title !== undefined && { title: dto.title }) },
    });
  }

  async deletePage(slug: string) {
    await this.getPageBySlug(slug);
    await this.prisma.page.delete({ where: { slug } });
    return { ok: true };
  }

  // ---- Blocks ----
  async createBlock(slug: string, dto: CreateBlockDto) {
    const page = await this.getPageBySlug(slug);
    const order =
      dto.order ??
      ((await this.prisma.block.count({ where: { pageId: page.id } })) || 0);
    return this.prisma.block.create({
      data: {
        pageId: page.id,
        type: dto.type,
        order,
        enabled: dto.enabled ?? true,
        data: dto.data as Prisma.InputJsonValue,
      },
    });
  }

  async updateBlock(id: number, dto: UpdateBlockDto) {
    const existing = await this.prisma.block.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Block not found');
    return this.prisma.block.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.data !== undefined && { data: dto.data as Prisma.InputJsonValue }),
      },
    });
  }

  async deleteBlock(id: number) {
    const existing = await this.prisma.block.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Block not found');
    await this.prisma.block.delete({ where: { id } });
    return { ok: true };
  }

  async reorderBlocks(slug: string, dto: ReorderBlocksDto) {
    const page = await this.getPageBySlug(slug);
    await this.prisma.$transaction(
      dto.items.map((it) =>
        this.prisma.block.updateMany({
          where: { id: it.id, pageId: page.id },
          data: { order: it.order },
        }),
      ),
    );
    return { ok: true };
  }

  // ---- SEO ----
  async upsertSeo(slug: string, dto: UpsertSeoDto) {
    const page = await this.getPageBySlug(slug);
    return this.prisma.seo.upsert({
      where: { pageId: page.id },
      create: {
        pageId: page.id,
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords,
        ogImage: dto.ogImage,
      },
      update: {
        title: dto.title,
        description: dto.description,
        keywords: dto.keywords ?? null,
        ogImage: dto.ogImage ?? null,
      },
    });
  }
}
