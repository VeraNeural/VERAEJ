import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie, isValidEmail, isValidPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING - 10 signup attempts per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`signin:${clientIp}`, 10, 900000); // 15 min

    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Too many signup attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime
      }, { status: 429 });
    }

    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await db.createUser(name, email, passwordHash);

    // Send welcome email (async, don't block signup)
    sendWelcomeEmail(user.email, user.name).catch((err: Error) => 
      console.error('Failed to send welcome email:', err.message)
    );

    // Generate token and set cookie
    const token = generateToken(user.id, user.email);
    await setAuthCookie(token);

    trackEvent.signup('email');
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
        trialEndsAt: user.trial_ends_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create account' 
    }, { status: 500 });
  }
}