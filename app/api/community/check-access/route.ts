import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'not_authenticated' 
      }, { status: 401 });
    }

    // Check user's subscription tier
    const userResult = await query(
      'SELECT subscription_tier, subscription_status FROM users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'user_not_found' 
      }, { status: 404 });
    }

    const { subscription_tier, subscription_status } = userResult.rows[0];

    // Check if user has active Regulator tier
    const hasAccess = 
      subscription_tier === 'regulator' && 
      (subscription_status === 'active' || subscription_status === 'trial');

    return NextResponse.json({
      hasAccess,
      tier: subscription_tier,
      status: subscription_status,
    });
  } catch (error) {
    console.error('Error checking community access:', error);
    return NextResponse.json(
      { hasAccess: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
