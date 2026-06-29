import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';

const candidateEnvPaths = [
  process.env.DOTENV_CONFIG_PATH,
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
].filter((envPath): envPath is string => Boolean(envPath));

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
    break;
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
});
