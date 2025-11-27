import { Request, Response, NextFunction } from 'express';

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Email validation
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Username validation
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      error: 'Username must be between 3 and 20 characters'
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    });
  }

  // Password validation
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters'
    });
  }

  // Password strength (optional but recommended)
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Email format validation
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  next();
}

