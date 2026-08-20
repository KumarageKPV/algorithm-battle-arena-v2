import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

/**
 * Port of C# [StudentOrAdmin] attribute.
 * Must be used after JwtAuthGuard.
 */
@Injectable()
export class StudentOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role !== 'Student' && user.role !== 'Admin') {
      throw new ForbiddenException('Student or Admin access required');
    }

    return true;
  }
}

