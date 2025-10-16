import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user has a ritual for today
    const result = await query(
      `SELECT * FROM daily_rituals 
       WHERE user_id = $1 AND date = $2`,
      [user.userId, today]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({
        ritual: result.rows[0],
      });
    } else {
      return NextResponse.json({
        ritual: null,
      });
    }
  } catch (error) {
    console.error('Error checking today ritual:', error);
    return NextResponse.json(
      { error: 'Failed to check ritual' },
      { status: 500 }
    );
  }
}
