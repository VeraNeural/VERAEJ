import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

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

    // Find user
    const result = await query(
      `SELECT id, email, password, subscription_status, subscription_tier, 
              trial_ends_at, orientation_completed, test_mode
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token and set cookie
    const token = generateToken(user.id, user.email, user.test_mode);
    await setAuthCookie(token);

    console.log('✅ User signed in:', user.email);

    return NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully',
        user: {
          id: user.id,
          email: user.email,
          subscription_status: user.subscription_status,
          subscription_tier: user.subscription_tier,
          trial_ends_at: user.trial_ends_at,
          orientation_completed: user.orientation_completed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Signin error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sign in. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
