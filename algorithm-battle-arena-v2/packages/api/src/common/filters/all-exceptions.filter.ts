import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const sanitizeJsonValue = (value: any, seen = new WeakSet<object>()): any => {
  if (typeof value === 'bigint') return Number(value);
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(item => sanitizeJsonValue(item, seen));
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);

    const sanitized: Record<string, any> = {};
    for (const [key, nested] of Object.entries(value)) {
      sanitized[key] = sanitizeJsonValue(nested, seen);
    }
    return sanitized;
  }
  return value;
};

/**
 * Port of C# ControllerHelper.SafeExecuteAsync — global exception filter.
 * Catches all unhandled exceptions and returns consistent error responses.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string' ? exResponse : exResponse;
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      message = `Internal server error: ${exception.message}`;
    }

    const payload = typeof message === 'object' ? message : { statusCode: status, message };
    response.status(status).json(sanitizeJsonValue(payload));
  }
}

