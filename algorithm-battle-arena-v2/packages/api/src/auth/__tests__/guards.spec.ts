import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { StudentGuard } from '../guards/student.guard';
import { StudentOrAdminGuard } from '../guards/student-or-admin.guard';

function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as any,
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('should allow Admin role', () => {
    const ctx = createMockContext({ role: 'Admin', email: 'admin@test.com' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException for Student role', () => {
    const ctx = createMockContext({ role: 'Student', email: 'student@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for Teacher role', () => {
    const ctx = createMockContext({ role: 'Teacher', email: 'teacher@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException when no user', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

describe('StudentGuard', () => {
  const guard = new StudentGuard();

  it('should allow Student role', () => {
    const ctx = createMockContext({ role: 'Student', email: 'student@test.com' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException for Admin role', () => {
    const ctx = createMockContext({ role: 'Admin', email: 'admin@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for Teacher role', () => {
    const ctx = createMockContext({ role: 'Teacher', email: 'teacher@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException when no user', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

describe('StudentOrAdminGuard', () => {
  const guard = new StudentOrAdminGuard();

  it('should allow Student role', () => {
    const ctx = createMockContext({ role: 'Student', email: 'student@test.com' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow Admin role', () => {
    const ctx = createMockContext({ role: 'Admin', email: 'admin@test.com' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException for Teacher role', () => {
    const ctx = createMockContext({ role: 'Teacher', email: 'teacher@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException when no user', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

