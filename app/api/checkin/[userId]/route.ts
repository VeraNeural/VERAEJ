import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();
    const { mood, energy, stress, sleep, note, timestamp } = body;

    // Check if user already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existing = await query(
      `SELECT id FROM daily_checkins 
       WHERE user_id = $1 
       AND DATE(created_at) = $2`,
      [userId, today]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Insert check-in
    await query(
      `INSERT INTO daily_checkins (user_id, mood, energy, stress, sleep, note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, mood, energy, stress, sleep, note || '', timestamp || new Date().toISOString()]
    );

    // Calculate streak
    const streakResult = await query(
      `SELECT COUNT(DISTINCT DATE(created_at)) as streak
       FROM daily_checkins
       WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      streak: parseInt(streakResult.rows[0]?.streak || '1')
    });

  } catch (error) {
    console.error('Save check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to save check-in' },
      { status: 500 }
    );
  }
}
