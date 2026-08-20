import { AuditLoggingMiddleware } from '../audit-logging.middleware';

describe('AuditLoggingMiddleware', () => {
  let middleware: AuditLoggingMiddleware;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ auditLogId: 1 }),
      },
    };
    middleware = new AuditLoggingMiddleware(mockPrisma);
  });

  function createReq(method: string, path: string, body: any = {}, user: any = null) {
    return { method, path, body, user, headers: {} } as any;
  }

  const mockRes = {} as any;
  const mockNext = jest.fn();

  afterEach(() => {
    mockNext.mockClear();
  });

  it('should call next() for all requests', async () => {
    await middleware.use(createReq('GET', '/api/Problems'), mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should NOT audit GET requests', async () => {
    await middleware.use(createReq('GET', '/api/Admin/users'), mockRes, mockNext);
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should NOT audit non-admin/non-user paths', async () => {
    await middleware.use(createReq('POST', '/api/Problems'), mockRes, mockNext);
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('should audit POST on /admin path', async () => {
    await middleware.use(createReq('POST', '/api/admin/import'), mockRes, mockNext);
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('should audit PUT on /users/ path', async () => {
    await middleware.use(createReq('PUT', '/api/users/123/deactivate'), mockRes, mockNext);
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('should audit DELETE on /admin path', async () => {
    await middleware.use(createReq('DELETE', '/api/admin/problems/1'), mockRes, mockNext);
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('should redact password fields in request body', async () => {
    const body = { email: 'test@test.com', password: 'secret123', name: 'John' };
    await middleware.use(createReq('POST', '/api/admin/register', body), mockRes, mockNext);

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    const afterState = JSON.parse(createCall.data.afterState);
    expect(afterState.password).toBe('[REDACTED]');
    expect(afterState.email).toBe('test@test.com');
    expect(afterState.name).toBe('John');
  });

  it('should redact token and secret fields', async () => {
    const body = { accessToken: 'abc', refreshToken: 'xyz', secretKey: 'k', data: 'ok' };
    await middleware.use(createReq('POST', '/api/admin/settings', body), mockRes, mockNext);

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    const afterState = JSON.parse(createCall.data.afterState);
    expect(afterState.accessToken).toBe('[REDACTED]');
    expect(afterState.refreshToken).toBe('[REDACTED]');
    expect(afterState.secretKey).toBe('[REDACTED]');
    expect(afterState.data).toBe('ok');
  });

  it('should extract actor userId from JWT claims', async () => {
    const user = { role: 'Student', studentId: 42, email: 'student@test.com' };
    await middleware.use(createReq('POST', '/api/admin/action', {}, user), mockRes, mockNext);

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.userId).toBe('Student:42');
  });

  it('should handle Admin actor', async () => {
    const user = { role: 'Admin', email: 'admin@test.com' };
    await middleware.use(createReq('PUT', '/api/users/1/deactivate', {}, user), mockRes, mockNext);

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.userId).toBe('Admin:admin@test.com');
  });

  it('should set correlationId from header when provided', async () => {
    const req = createReq('POST', '/api/admin/action');
    req.headers['x-correlation-id'] = 'custom-correlation-123';

    await middleware.use(req, mockRes, mockNext);

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.correlationId).toBe('custom-correlation-123');
  });

  it('should not throw even if audit logging fails', async () => {
    mockPrisma.auditLog.create.mockRejectedValue(new Error('DB down'));

    await middleware.use(createReq('POST', '/api/admin/action'), mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled(); // Should still call next()
  });
});

