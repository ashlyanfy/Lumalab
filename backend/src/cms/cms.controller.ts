import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { CmsService } from './cms.service';
import {
  CreateBlockDto,
  ReorderBlocksDto,
  UpdateBlockDto,
} from './dto/upsert-block.dto';
import { UpdatePageDto, UpsertPageDto } from './dto/upsert-page.dto';
import { UpsertSeoDto } from './dto/upsert-seo.dto';

@Controller()
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  // ---- Public — landing fetches by slug ----
  @Get('pages/public/:slug')
  publicPage(@Param('slug') slug: string) {
    return this.cms.getPublicPage(slug);
  }

  // ---- Admin (ADMIN-only mutations, MANAGER read-only) ----
  @Get('pages')
  @UseGuards(JwtAuthGuard)
  listPages() {
    return this.cms.listPages();
  }

  @Get('pages/:slug')
  @UseGuards(JwtAuthGuard)
  getPage(@Param('slug') slug: string) {
    return this.cms.getPageBySlug(slug);
  }

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPage(@Body() dto: UpsertPageDto) {
    return this.cms.createPage(dto);
  }

  @Patch('pages/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePage(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.cms.updatePage(slug, dto);
  }

  @Delete('pages/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deletePage(@Param('slug') slug: string) {
    return this.cms.deletePage(slug);
  }

  // ---- Blocks ----
  @Post('pages/:slug/blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createBlock(@Param('slug') slug: string, @Body() dto: CreateBlockDto) {
    return this.cms.createBlock(slug, dto);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateBlock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlockDto) {
    return this.cms.updateBlock(id, dto);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteBlock(@Param('id', ParseIntPipe) id: number) {
    return this.cms.deleteBlock(id);
  }

  @Post('pages/:slug/blocks/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reorder(@Param('slug') slug: string, @Body() dto: ReorderBlocksDto) {
    return this.cms.reorderBlocks(slug, dto);
  }

  // ---- SEO ----
  @Put('pages/:slug/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  upsertSeo(@Param('slug') slug: string, @Body() dto: UpsertSeoDto) {
    return this.cms.upsertSeo(slug, dto);
  }
}
