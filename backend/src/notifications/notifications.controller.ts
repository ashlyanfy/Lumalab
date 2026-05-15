import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribePushDto, UnsubscribePushDto } from './dto/push.dto';
import { PushService } from './push.service';

@Controller('push')
export class NotificationsController {
  constructor(private readonly push: PushService) {}

  @Get('public-key')
  publicKey() {
    return { publicKey: this.push.getPublicKey(), enabled: this.push.isEnabled() };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Body() dto: SubscribePushDto, @CurrentUser() user: AuthUser) {
    return this.push.subscribe(dto, user.id);
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Body() dto: UnsubscribePushDto) {
    return this.push.unsubscribe(dto.endpoint);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async test() {
    await this.push.sendTest();
    return { ok: true };
  }
}
