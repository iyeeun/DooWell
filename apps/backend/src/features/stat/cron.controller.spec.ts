import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { CronController } from './cron.controller';
import { StatService } from './stat.service';

describe('CronController', () => {
  const secret = 'cron-secret-at-least-16-characters';

  const createController = (configuredSecret?: string) => {
    const configService = {
      get: jest.fn().mockReturnValue(configuredSecret),
    } as unknown as ConfigService;
    const statService = {
      calculateDailyUserStats: jest.fn().mockResolvedValue(undefined),
    } as unknown as StatService;

    return {
      controller: new CronController(configService, statService),
      statService,
    };
  };

  it('올바른 bearer secret이면 일일 통계를 계산한다', async () => {
    const { controller, statService } = createController(secret);

    await expect(controller.calculateDailyUserStats(`Bearer ${secret}`)).resolves.toEqual({
      success: true,
    });
    expect(statService.calculateDailyUserStats).toHaveBeenCalledTimes(1);
  });

  it('secret이 일치하지 않으면 요청을 거부한다', async () => {
    const { controller, statService } = createController(secret);

    await expect(controller.calculateDailyUserStats('Bearer invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(statService.calculateDailyUserStats).not.toHaveBeenCalled();
  });

  it('서버에 secret이 없으면 엔드포인트를 비활성화한다', async () => {
    const { controller } = createController();

    await expect(controller.calculateDailyUserStats()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
