import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';
import { TelegramService } from './telegram.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [TelegramService, PushService],
  exports: [TelegramService, PushService],
})
export class NotificationsModule {}
