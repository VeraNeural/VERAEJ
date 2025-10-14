import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Check if test user
    let user;
    if (payload.testMode) {
      const testUserResult = await query(
        `SELECT * FROM test_users WHERE id = $1`,
        [payload.userId]
      );
      user = testUserResult.rows[0];
    } else {
      user = await db.getUserById(payload.userId);
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
        trialEndsAt: user.trial_ends_at,
        test_mode: payload.testMode || false
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

// Sign out endpoint
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookie
  response.cookies.delete('auth_token');
  
  return response;
}

// http://localhost:3000/api/auth/me