import { DataSource } from 'typeorm';
import { Campaign } from './campaign.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'campaigns',
  entities: [Campaign],
  synchronize: true, // vain dev
  logging: true,
});
