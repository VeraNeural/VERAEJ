import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get completed rituals ordered by date descending
    const result = await query(
      `SELECT date 
       FROM daily_rituals 
       WHERE user_id = $1 AND completed = true
       ORDER BY date DESC`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ streak: 0 });
    }

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < result.rows.length; i++) {
      const ritualDate = new Date(result.rows[i].date);
      ritualDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (ritualDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({ streak });
  } catch (error) {
    console.error('Error calculating streak:', error);
    return NextResponse.json(
      { error: 'Failed to calculate streak' },
      { status: 500 }
    );
  }
}
