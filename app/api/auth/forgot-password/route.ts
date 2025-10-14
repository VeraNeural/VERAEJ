import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // RATE LIMITING - 3 attempts per hour per email
    const rateLimitResult = rateLimit(`reset:${email}`, 3, 3600000); // 1 hour
    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Too many password reset requests. Please try again later.',
      }, { status: 429 });
    }

    const user = await db.getUserByEmail(email);

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ 
        message: 'If that email exists, we sent reset instructions' 
      }, { status: 200 });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Save token to database
    await db.createResetToken(user.id, token);

    // Send email
    await sendPasswordResetEmail(user.email, user.name, token);

    return NextResponse.json({ 
      message: 'Reset instructions sent' 
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}