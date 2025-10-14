import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json(); // ← ADD NAME
    
    if (!name || !email || !password) { // ← ADD NAME CHECK
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

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

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, subscription_status, subscription_tier, created_at) VALUES ($1, $2, $3, 'free', 'free', NOW()) RETURNING id, name, email, subscription_status, subscription_tier`, // ← ADD NAME
      [name, email.toLowerCase(), hashedPassword] // ← ADD NAME
    );

    const user = result.rows[0];

    const token = generateToken(user.id, user.email);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name, // ← ADD NAME
          email: user.email,
          subscription_status: user.subscription_status,
          subscription_tier: user.subscription_tier,
          orientation_completed: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
