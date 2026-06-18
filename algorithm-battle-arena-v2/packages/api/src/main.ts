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
  
  // Allow all origins in production (can be restricted later)
  const allowedOrigins = isDev
    ? [
        'http://localhost:5173',
        'http://localhost:4200',
        'http://localhost:3000',
        'http://localhost:8000',
      ]
    : [
        'https://nullify-livid.vercel.app',
        'https://nullify-2iau.onrender.com',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // In development, allow all localhost
      if (isDev && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      // In production, check against allowed origins or Vercel domains
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
    credentials: true,
  });

  // ─── Start Listening ─────────────────────────────────────────────
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0'); // Bind to 0.0.0.0 for Render

  logger.log(`🏟️  Algorithm Battle Arena API running on port ${port}`);
  logger.log(`📡  Socket.IO namespaces: /lobby, /chat`);
  logger.log(`🌐  Public URL: https://nullify-2iau.onrender.com`);

  if (isDev) {
    logger.log(`🔧  Development mode — CORS allows localhost origins`);
  } else {
    logger.log(`🚀  Production mode — CORS configured for Vercel frontend`);
  }
}

bootstrap();
