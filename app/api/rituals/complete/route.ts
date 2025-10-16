import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { ritualId, reflection } = await request.json();

    if (!ritualId) {
      return NextResponse.json(
        { error: 'Ritual ID required' },
        { status: 400 }
      );
    }

    // Mark ritual as completed
    const result = await query(
      `UPDATE daily_rituals 
       SET completed = true, 
           completed_at = NOW(),
           reflection = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [reflection, ritualId, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ritual not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ritual: result.rows[0],
    });
  } catch (error) {
    console.error('Error completing ritual:', error);
    return NextResponse.json(
      { error: 'Failed to complete ritual' },
      { status: 500 }
    );
  }
}
