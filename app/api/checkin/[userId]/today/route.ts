import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/checkin/:userId/today - Check if user checked in today
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const result = await query(
      `SELECT * FROM check_ins
       WHERE user_id = $1
       AND DATE(timestamp) = CURRENT_DATE
       ORDER BY timestamp DESC
       LIMIT 1`,
      [userId]
    );

    const streakResult = await query(
      `SELECT COUNT(DISTINCT DATE(timestamp)) as streak
       FROM check_ins
       WHERE user_id = $1
       AND timestamp >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return NextResponse.json({
      checkedIn: result.rows.length > 0,
      data: result.rows[0] || null,
      streak: streakResult.rows[0].streak || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to check today status:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}