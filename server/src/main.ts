import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const createCookieParser = cookieParser as unknown as () => RequestHandler;
  app.use(createCookieParser());
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['x-user-id'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });
  await app.listen(3000);
}

void bootstrap();
