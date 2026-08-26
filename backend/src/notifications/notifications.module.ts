import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';
import { SenderService } from './sender.service';
import { TelegramService } from './telegram.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [TelegramService, PushService, EmailService, SenderService],
  exports: [TelegramService, PushService, EmailService, SenderService],
})
export class NotificationsModule {}
