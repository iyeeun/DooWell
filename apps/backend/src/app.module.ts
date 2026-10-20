import { Inject, Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import session from 'express-session';
import type { RequestHandler } from 'express';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

import {
  BatchModule,
  ExecutionContextEntity,
  JobExecutionEntity,
  JobLockEntity,
  StepExecutionEntity,
} from '@web24/batch';
import { GoalModule } from './features/goal/goal.module';
import { BehaviorModule } from './features/behavior/behavior.module';
import { AIModule } from './features/ai/ai.module';
import { AuthModule } from './features/auth/auth.module';
import { StatModule } from './features/stat/stat.module';
import { PushModule } from './features/push/push.module';
import { ChatModule } from './features/chat/chat.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.production.local',
        '.env.development.local',
        'apps/backend/.env.production.local',
        'apps/backend/.env.development.local',
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .optional(),
        DIRECT_DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .optional(),
        DB_HOST: Joi.string().optional(),
        DB_PORT: Joi.number().port().optional(),
        DB_USER: Joi.string().optional(),
        DB_PASS: Joi.string().optional(),
        DB_NAME: Joi.string().optional(),
        DATABASE_POOL_MAX: Joi.number().integer().min(1).optional(),
        DATABASE_SSL: Joi.boolean().optional(),
        SESSION_SECRET: Joi.string().required(),
        SESSION_MAX_AGE_MS: Joi.number().required(),
        CLOVA_API_KEY: Joi.string().optional(),
        VAPID_PUBLIC_KEY: Joi.string().required(),
        VAPID_PRIVATE_KEY: Joi.string().required(),
        VAPID_SUBJECT: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        SWAGGER_ENABLED: Joi.boolean().optional(),
        SLACK_WEBHOOK_URL: Joi.string().uri().optional(),
        CRON_SECRET: Joi.string().min(16).optional(),
      })
        .or('DATABASE_URL', 'DB_HOST')
        .and('DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.getOrThrow('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');
        const poolMax = config.get<number>('DATABASE_POOL_MAX') ?? (process.env.VERCEL ? 1 : 10);
        const useSsl = config.get<boolean>('DATABASE_SSL') ?? isProd;
        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: useSsl ? { rejectUnauthorized: false } : false,
              }
            : {
                host: config.getOrThrow<string>('DB_HOST'),
                port: config.getOrThrow<number>('DB_PORT'),
                username: config.getOrThrow<string>('DB_USER'),
                password: config.getOrThrow<string>('DB_PASS'),
                database: config.getOrThrow<string>('DB_NAME'),
              }),
          extra: {
            max: poolMax,
            keepAlive: true,
            idleTimeoutMillis: 10_000,
            connectionTimeoutMillis: 10_000,
          },
          entities: [
            JobExecutionEntity,
            StepExecutionEntity,
            ExecutionContextEntity,
            JobLockEntity,
          ],
          autoLoadEntities: true,
          synchronize: false,
          logging: !isProd,
        };
      },
    }),
    BatchModule.forRoot({ dataSourceToken: getDataSourceToken() }),
    GoalModule,
    BehaviorModule,
    AIModule,
    AuthModule,
    StatModule,
    PushModule,
    ChatModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const max = config.get<number>('DATABASE_POOL_MAX') ?? (process.env.VERCEL ? 1 : 10);
        const isProd = config.getOrThrow('NODE_ENV') === 'production';
        const useSsl = config.get<boolean>('DATABASE_SSL') ?? isProd;
        return new Pool({
          ...(databaseUrl
            ? {
                connectionString: databaseUrl,
                ssl: useSsl ? { rejectUnauthorized: false } : false,
              }
            : {
                host: config.getOrThrow<string>('DB_HOST'),
                port: config.getOrThrow<number>('DB_PORT'),
                user: config.getOrThrow<string>('DB_USER'),
                password: config.getOrThrow<string>('DB_PASS'),
                database: config.getOrThrow<string>('DB_NAME'),
              }),
          max,
          keepAlive: true,
          idleTimeoutMillis: 10_000,
          connectionTimeoutMillis: 10_000,
        });
      },
    },
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly configService: ConfigService,
    @Inject('PG_POOL') private readonly pool: Pool,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const isProd = this.configService.getOrThrow('NODE_ENV') === 'production';
    const PgSessionStore = connectPgSimple(session);

    const sessionMiddleware: RequestHandler = session({
      store: new PgSessionStore({
        pool: this.pool,
        tableName: 'user_sessions',
        createTableIfMissing: false,
      }),
      secret: this.configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: this.configService.getOrThrow<number>('SESSION_MAX_AGE_MS'),
      },
    });

    consumer.apply(sessionMiddleware).forRoutes('*');
  }
}
