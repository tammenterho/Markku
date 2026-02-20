import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';
import { join } from 'path';
import * as express from 'express';
import { mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const createCookieParser = cookieParser as unknown as () => RequestHandler;
  mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });
  app.use(createCookieParser());
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['x-user-id'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}

void bootstrap();
