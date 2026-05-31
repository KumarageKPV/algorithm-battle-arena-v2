import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';

/**
 * Application entry point — mirrors C# Program.cs.
 *
 * Middleware pipeline order (same as ASP.NET):
 * 1. CORS
 * 2. Body parsing (built-in)
 * 3. Authentication (Passport JWT)
 * 4. Audit Logging (custom middleware applied in AppModule)
 * 5. Authorization (guards)
 * 6. Controllers + Socket.IO gateways
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('json replacer', (_key: string, value: unknown) =>
    typeof value === 'bigint' ? Number(value) : value,
  );

  // ─── Global Validation Pipe ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(cookieParser());

  // ─── Global Exception Filter (port of ControllerHelper) ─────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── CORS (mirrors Program.cs DevCors/ProdCors) ─────────────────
  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: isDev
      ? [
          'http://localhost:5173', // Vite (existing React frontend)
          'http://localhost:4200',
          'http://localhost:3000', // Next.js (new frontend)
          'http://localhost:8000',
        ]
      : [
          process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app',
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
    credentials: true,
  });

  // ─── Start Listening ─────────────────────────────────────────────
  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`🏟️  Algorithm Battle Arena API running on http://localhost:${port}`);
  logger.log(`📡  Socket.IO namespaces: /lobby, /chat`);

  if (isDev) {
    logger.log(`🔧  Development mode — CORS allows localhost origins`);
  }
}

bootstrap();
