import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const isProd = process.env.NODE_ENV === 'production';
  const rawOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (rawOrigins.length === 0 || rawOrigins.includes('*')) {
    if (isProd) {
      throw new Error(
        'CORS_ORIGINS must be set to an explicit list in production (no wildcards).',
      );
    }
    app.enableCors({ origin: true, credentials: true });
    logger.warn('CORS: allowing all origins (development mode)');
  } else {
    app.enableCors({ origin: rawOrigins, credentials: true });
    logger.log(`CORS origins: ${rawOrigins.join(', ')}`);
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`LumaLab API listening on http://localhost:${port}/api/v1`);
}

bootstrap();
