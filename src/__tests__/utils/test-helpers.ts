import jwt from 'jsonwebtoken';

export function generateTestToken(playerId: string = '507f1f77bcf86cd799439011'): string {
  return jwt.sign(
    { playerId },
    process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long',
    { expiresIn: '1h' }
  );
}

export function createMockRequest(overrides: any = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  };
}

export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
}

export function createMockNext() {
  return jest.fn();
}

