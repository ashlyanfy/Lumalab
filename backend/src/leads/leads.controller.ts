import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Request, Response } from 'express';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { LeadKind, LeadStatus } from '@prisma/client';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { buildLeadsXlsx, buildOneLeadXlsx } from './leads.export';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // --- Public submit ---
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] ?? undefined;
    return this.leads.create(dto, { ip, userAgent });
  }

  // --- Admin endpoints ---
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() q: ListLeadsDto) {
    return this.leads.findMany(q);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  stats() {
    return this.leads.stats();
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  daily(
    @Query('days') days?: string,
    @Query('status') status?: string,
    @Query('kind') kind?: string,
  ) {
    const statusEnum =
      status && (Object.values(LeadStatus) as string[]).includes(status)
        ? (status as LeadStatus)
        : undefined;
    const kindEnum =
      kind && (Object.values(LeadKind) as string[]).includes(kind)
        ? (kind as LeadKind)
        : undefined;
    return this.leads.daily(Number(days ?? 14), statusEnum, kindEnum);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  async export(@Query() q: ListLeadsDto, @Res() res: Response) {
    const leads = await this.leads.findManyForExport(q);
    const buf = await buildLeadsXlsx(leads);
    const stamp = new Date().toISOString().slice(0, 10);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="lumalab-leads-${stamp}.xlsx"`,
      'Content-Length': buf.length,
    });
    res.end(buf);
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportOne(@Param('id') id: string, @Res() res: Response) {
    const lead = await this.leads.findOne(id);
    const buf = await buildOneLeadXlsx(lead);
    const stamp = new Date(lead.createdAt).toISOString().slice(0, 10);
    const safeName =
      (lead.kind === 'COMPANY' ? lead.companyName : lead.desiredRole) ?? lead.id;
    const filename = `lumalab-${lead.kind.toLowerCase()}-${stamp}-${safeName
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .slice(0, 40)}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buf.length,
    });
    res.end(buf);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.leads.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leads.update(id, dto, user.id);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leads.addNote(id, user.id, dto.body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }
}
