import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email - FIXED!
    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);
    trackEvent.signin('email');

    // Create response with required structure
    const response = NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status
      },
      message: 'Signed in successfully' 
    }, { status: 200 });

    // Set auth cookie with correct name and settings
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // THIS IS CRITICAL - makes cookie available everywhere
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    );
  }
}