import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { SettingsService } from './settings.service';
import {
  NotificationChannel,
  NotificationSettings,
} from './settings.types';

class UpdateNotificationsDto implements NotificationSettings {
  @IsIn(['off', 'email', 'telegram', 'both'])
  channel!: NotificationChannel;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  telegramChatId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  emailRecipients!: string;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // Anyone with admin access can read.
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  get() {
    return this.settings.getNotifications();
  }

  // Only ADMIN can change delivery preferences.
  @Put('notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateNotificationsDto) {
    return this.settings.setNotifications(dto);
  }
}
