import { Request, Response, NextFunction } from 'express';
import { validateRegister, validateLogin } from '../../middleware/validation.middleware';
import { createMockRequest, createMockResponse, createMockNext } from '../utils/test-helpers';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = createMockNext();
  });

  describe('validateRegister', () => {
    it('should call next() with valid data', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 400 if missing fields', () => {
      mockRequest.body = {
        username: 'testuser',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 400 if email is invalid', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email format',
      });
    });

    it('should return 400 if username is too short', () => {
      mockRequest.body = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password is too weak', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateLogin', () => {
    it('should call next() with valid data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 400 if missing fields', () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email is invalid', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});

