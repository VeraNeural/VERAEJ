import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's subscription tier
    const userResult = await query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [user.userId]
    );

    const userTier = userResult.rows[0]?.subscription_tier || 'free';

    // Get channels user has access to
    const channelsResult = await query(
      `SELECT id, name, slug, description, icon, required_tier, position
       FROM community_channels
       WHERE required_tier IS NULL OR required_tier = $1
       ORDER BY position ASC`,
      [userTier]
    );

    return NextResponse.json({
      channels: channelsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}
