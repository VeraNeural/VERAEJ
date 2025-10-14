import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_NAME = 'auth_token';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export function generateToken(userId: string, email: string, testMode: boolean = false): string {
  return jwt.sign(
    { 
      userId, 
      email,
      testMode 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string; testMode?: boolean } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string;
      testMode?: boolean;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}

// Remove auth cookie
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// Get current user from token
export async function getCurrentUser(): Promise<{ userId: string; email: string } | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// Middleware helper to protect routes
export function requireAuth(request: NextRequest): { userId: string; email: string } | null {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// Check if trial is active
export function isTrialActive(trialEndsAt: Date): boolean {
  return new Date() < new Date(trialEndsAt);
}

// Check if subscription is active
export function hasActiveSubscription(status: string, trialEndsAt: Date): boolean {
  return status === 'active' || (status === 'trial' && isTrialActive(trialEndsAt));
}