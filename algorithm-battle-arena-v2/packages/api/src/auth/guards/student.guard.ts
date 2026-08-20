import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

/**
 * Port of C# [StudentOnly] attribute.
 * Must be used after JwtAuthGuard.
 */
@Injectable()
export class StudentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role !== 'Student') {
      throw new ForbiddenException('Student access required');
    }

    return true;
  }
}

