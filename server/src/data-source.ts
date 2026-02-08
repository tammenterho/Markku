import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'campaigns',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
});
