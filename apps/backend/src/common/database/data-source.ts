import 'reflect-metadata';
import * as path from 'node:path';
import { config as loadEnv, DotenvConfigOptions } from 'dotenv';
import { DataSource } from 'typeorm';
import {
  ExecutionContextEntity,
  JobExecutionEntity,
  JobLockEntity,
  StepExecutionEntity,
} from '@web24/batch';

const isProd = process.env.NODE_ENV === 'production';
const envFile = isProd ? '.env.production.local' : '.env.development.local';
const loadEnvSafe = loadEnv as (options?: DotenvConfigOptions) => void;
loadEnvSafe({ path: envFile });
const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const useSsl = process.env.DATABASE_SSL
  ? process.env.DATABASE_SSL === 'true'
  : process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? {
        url: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      }),
  entities: [
    path.join(__dirname, '..', '..', '**', '*.entity.{ts,js}'),
    JobExecutionEntity,
    StepExecutionEntity,
    ExecutionContextEntity,
    JobLockEntity,
  ],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: !isProd,
});
