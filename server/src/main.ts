import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['x-user-id'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });
  await app.listen(3000);
}

bootstrap();
