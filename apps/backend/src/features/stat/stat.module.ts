import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatEventLog } from './stat-event-log.entity';
import { DailyUserStat } from './daily-user-stat.entity';
import { StatService } from './stat.service';
import { User } from '../user/user.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { Behavior } from '../behavior/behavior.entity';
import { StatController } from './stat.controller';
import { SlackModule } from '../../common/slack/slack.module';
import { DailyUserStatJob } from './daily-user-stat.job';
import { CronController } from './cron.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TodayBehavior, DailyUserStat, StatEventLog, Goal, Behavior]),
    SlackModule,
  ],
  controllers: [StatController, CronController],
  providers: [StatService, DailyUserStatJob],
})
export class StatModule {}
