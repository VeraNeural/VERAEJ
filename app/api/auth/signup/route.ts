import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - use password_hash column to match your database
    const result = await query(
      `INSERT INTO users (email, password_hash, subscription_status, subscription_tier, created_at)
       VALUES ($1, $2, 'free', 'free', NOW())
       RETURNING id, email, subscription_status, subscription_tier`,
      [email.toLowerCase(), hashedPassword]
    );

    const user = result.rows[0];

    // Generate token and set cookie
    const token = generateToken(user.id, user.email);
    await setAuthCookie(token);

    console.log('✅ User created:', user.email);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          subscription_status: user.subscription_status,
          subscription_tier: user.subscription_tier,
          orientation_completed: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
