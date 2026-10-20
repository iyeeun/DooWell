import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionLoggingFilter } from './common/logger/http-exception.filter';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { openApiDocument } from './common/docs/openapi';
import { isSwaggerEnabled } from './common/docs/swagger.config';

let sentryInitialized = false;

function initializeSentry() {
  if (sentryInitialized) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.01),
    integrations: [nodeProfilingIntegration()],
  });
  sentryInitialized = true;
}

export async function createNestApp(): Promise<NestExpressApplication> {
  initializeSentry();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV !== 'development') {
    app.set('trust proxy', 1);
  }

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionLoggingFilter());

  const configService = app.get(ConfigService);
  const swaggerEnabled = isSwaggerEnabled(
    configService.get<boolean>('SWAGGER_ENABLED'),
    configService.get<string>('NODE_ENV'),
  );

  if (swaggerEnabled) {
    SwaggerModule.setup('api/docs', app, openApiDocument as OpenAPIObject);
  }

  return app;
}
