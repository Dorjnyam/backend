import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { generateTestToken, createMockRequest, createMockResponse, createMockNext } from '../utils/test-helpers';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = createMockNext();
  });

  it('should call next() with valid token', () => {
    const token = generateTestToken();
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.playerId).toBeDefined();
  });

  it('should return 401 if no token provided', () => {
    mockRequest.headers = {};

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'No token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix', () => {
    const token = generateTestToken();
    mockRequest.headers = {
      authorization: token,
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
  });
});

