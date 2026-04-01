import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

/**
 * Port of C# AuditLoggingMiddleware.
 * Intercepts PUT, POST, DELETE on paths containing /admin or /users/.
 * Sanitizes request body — replaces fields containing password/pass/token/secret with [REDACTED].
 * Extracts actor ID from JWT claims.
 */
@Injectable()
export class AuditLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLoggingMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Set correlation ID
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();
    (req as any).correlationId = correlationId;

    // Check if this request should be audited
    if (this.shouldAudit(req)) {
      await this.logAudit(req, correlationId);
    }

    next();
  }

  private shouldAudit(req: Request): boolean {
    const method = req.method;
    const path = (req.path || '').toLowerCase();

    return (
      (method === 'PUT' || method === 'POST' || method === 'DELETE') &&
      (path.includes('/admin') || path.includes('/users/'))
    );
  }

  private async logAudit(req: Request, correlationId: string): Promise<void> {
    try {
      const user = (req as any).user;
      const actorUserId = this.getActorUserId(user);
      const requestBody = this.getSanitizedBody(req.body);

      await this.prisma.auditLog.create({
        data: {
          userId: actorUserId,
          action: req.method,
          entityType: this.extractResourceType(req.path),
          entityId: this.extractResourceId(req.path),
          beforeState: '',
          afterState: requestBody,
          correlationId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for ${req.method} ${req.path}`,
        error,
      );
    }
  }

  private getActorUserId(user: any): string {
    if (!user) return '';

    const role = user.role;
    const studentId = user.studentId;
    const teacherId = user.teacherId;
    const email = user.email;

    switch (role) {
      case 'Student':
        return `Student:${studentId || ''}`;
      case 'Teacher':
        return `Teacher:${teacherId || ''}`;
      case 'Admin':
        return `Admin:${email || ''}`;
      default:
        return email || '';
    }
  }

  private getSanitizedBody(body: any): string {
    if (!body || typeof body !== 'object') return '{}';

    try {
      const sanitized = this.sanitizeValue(body);
      return JSON.stringify(sanitized);
    } catch {
      return '{}';
    }
  }

  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map((v) => this.sanitizeValue(v));
    if (typeof value === 'object') {
      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.shouldRedact(key) ? '[REDACTED]' : this.sanitizeValue(val);
      }
      return result;
    }
    return value;
  }

  private shouldRedact(propertyName: string): boolean {
    const lower = propertyName.toLowerCase();
    return (
      lower.includes('password') ||
      lower.includes('pass') ||
      lower.includes('token') ||
      lower.includes('accesstoken') ||
      lower.includes('refreshtoken') ||
      lower.includes('secret')
    );
  }

  private extractResourceType(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1 ? segments[1] : 'Unknown';
  }

  private extractResourceId(path: string): string {
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 2 && /^\d+$/.test(segments[2])) {
      return segments[2];
    }
    return '';
  }
}

