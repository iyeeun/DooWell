import {
  Controller,
  Get,
  Headers,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { StatService } from './stat.service';

@Controller('internal/cron')
export class CronController {
  constructor(
    private readonly configService: ConfigService,
    private readonly statService: StatService,
  ) {}

  @Get('daily-user-stats')
  async calculateDailyUserStats(@Headers('authorization') authorization?: string) {
    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('Cron endpoint is not configured');
    }

    const providedSecret = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';
    const expected = Buffer.from(secret);
    const provided = Buffer.from(providedSecret);

    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      throw new UnauthorizedException();
    }

    await this.statService.calculateDailyUserStats();
    return { success: true };
  }
}
