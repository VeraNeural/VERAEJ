import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if user has checked in today
    const result = await query(
      `SELECT * FROM daily_checkins 
       WHERE user_id = $1 
       AND DATE(created_at) = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, today]
    );

    if (result.rows.length > 0) {
      const checkin = result.rows[0];
      
      // Get streak
      const streakResult = await query(
        `SELECT COUNT(DISTINCT DATE(created_at)) as streak
         FROM daily_checkins
         WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC`,
        [userId]
      );

      return NextResponse.json({
        checkedIn: true,
        data: {
          mood: checkin.mood,
          energy: checkin.energy,
          stress: checkin.stress,
          sleep: checkin.sleep,
          note: checkin.note
        },
        streak: parseInt(streakResult.rows[0]?.streak || '0')
      });
    }

    // Get streak even if not checked in today
    const streakResult = await query(
      `SELECT COUNT(DISTINCT DATE(created_at)) as streak
       FROM daily_checkins
       WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return NextResponse.json({
      checkedIn: false,
      streak: parseInt(streakResult.rows[0]?.streak || '0')
    });

  } catch (error) {
    console.error('Check-in status error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
