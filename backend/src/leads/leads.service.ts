import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LeadKind, LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

export interface CreateLeadContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto, ctx: CreateLeadContext) {
    if (dto.botField && dto.botField.length > 0) {
      throw new BadRequestException('Invalid submission');
    }

    // Per-kind minimum-field check
    if (dto.kind === LeadKind.COMPANY && !dto.companyName) {
      throw new BadRequestException('companyName is required for COMPANY leads');
    }
    if (dto.kind === LeadKind.TALENT && !dto.desiredRole) {
      throw new BadRequestException('desiredRole is required for TALENT leads');
    }

    const lead = await this.prisma.lead.create({
      data: {
        kind: dto.kind,
        contactName: dto.contactName,
        email: dto.email,
        whatsapp: dto.whatsapp,
        comment: dto.comment,
        locale: dto.locale,
        companyName: dto.companyName,
        companySite: dto.companySite,
        industry: dto.industry,
        stage: dto.stage,
        revenueRange: dto.revenueRange,
        equityReady: dto.equityReady,
        desiredRole: dto.desiredRole,
        workFormat: dto.workFormat,
        country: dto.country,
        data: (dto.data ?? {}) as Prisma.InputJsonValue,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });

    this.logger.log(`Lead created #${lead.id} (${lead.kind}) from ${lead.email}`);

    // Day 2: fire-and-forget telegram/push will go here.

    return { ok: true, id: lead.id };
  }

  async findMany(q: ListLeadsDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 25;

    const where: Prisma.LeadWhereInput = {};
    if (q.kind) where.kind = q.kind;
    if (q.status) where.status = q.status;
    if (q.desiredRole) where.desiredRole = q.desiredRole;
    if (q.industry) where.industry = { contains: q.industry, mode: 'insensitive' };

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(q.from);
      if (q.to) {
        const end = new Date(q.to);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Prisma.DateTimeFilter).lte = end;
      }
    }

    if (q.q) {
      const term = q.q.trim();
      where.OR = [
        { contactName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { whatsapp: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } },
        { companySite: { contains: term, mode: 'insensitive' } },
        { industry: { contains: term, mode: 'insensitive' } },
        { country: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findManyForExport(q: ListLeadsDto) {
    const where: Prisma.LeadWhereInput = {};
    if (q.kind) where.kind = q.kind;
    if (q.status) where.status = q.status;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(q.from);
      if (q.to) {
        const end = new Date(q.to);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Prisma.DateTimeFilter).lte = end;
      }
    }
    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true, role: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id);
    const data: Prisma.LeadUpdateInput = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assigneeId !== undefined) {
      if (!dto.assigneeId) {
        data.assignee = { disconnect: true };
      } else {
        data.assignee = { connect: { id: dto.assigneeId } };
      }
    }
    return this.prisma.lead.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async addNote(leadId: string, authorId: string, body: string) {
    await this.findOne(leadId);
    return this.prisma.leadNote.create({
      data: { leadId, authorId, body },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { ok: true };
  }

  async stats() {
    const [
      total,
      newCount,
      inProgress,
      contacted,
      ndaSigned,
      pilot,
      partnership,
      rejected,
      archived,
      last7,
    ] = await this.prisma.$transaction([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'NEW' } }),
      this.prisma.lead.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.lead.count({ where: { status: 'CONTACTED' } }),
      this.prisma.lead.count({ where: { status: 'NDA_SIGNED' } }),
      this.prisma.lead.count({ where: { status: 'PILOT' } }),
      this.prisma.lead.count({ where: { status: 'PARTNERSHIP' } }),
      this.prisma.lead.count({ where: { status: 'REJECTED' } }),
      this.prisma.lead.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.lead.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);
    return {
      total,
      byStatus: {
        NEW: newCount,
        IN_PROGRESS: inProgress,
        CONTACTED: contacted,
        NDA_SIGNED: ndaSigned,
        PILOT: pilot,
        PARTNERSHIP: partnership,
        REJECTED: rejected,
        ARCHIVED: archived,
      } satisfies Record<LeadStatus, number>,
      last7,
    };
  }

  async daily(days: number) {
    const clamped = Math.min(60, Math.max(7, days));
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (clamped - 1));

    const rows = await this.prisma.lead.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < clamped; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
