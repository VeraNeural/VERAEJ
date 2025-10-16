import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check trial status
    let tier = user.subscription_tier || 'explorer';
    let status = user.subscription_status;

    if (status === 'trial') {
      const trialEndsAt = new Date(user.trial_ends_at);
      const now = new Date();
      
      if (now > trialEndsAt) {
        status = 'expired';
      }
    }

    const token = generateToken(user.id, user.email);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription_status: status,
        subscription_tier: tier,
        trial_ends_at: user.trial_ends_at,
        orientation_completed: user.orientation_completed,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sign in. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
