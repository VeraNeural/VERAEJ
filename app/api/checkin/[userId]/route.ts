import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/checkin/:userId - Submit daily check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { mood, energy, stress, sleep, note, timestamp } = await request.json();

    const result = await query(
      `INSERT INTO check_ins (user_id, mood, energy, stress, sleep, note, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, mood, energy, stress, sleep, note, timestamp]
    );

    // Calculate streak
    const streakResult = await query(
      `SELECT COUNT(DISTINCT DATE(timestamp)) as streak
       FROM check_ins
       WHERE user_id = $1
       AND timestamp >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return NextResponse.json({
      checkIn: result.rows[0],
      streak: streakResult.rows[0].streak
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to save check-in:', error);
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
  }
}