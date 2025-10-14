import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get today's voice usage
    const today = new Date().toISOString().split('T')[0];
    
  const result = await query(
      `SELECT usage_count FROM voice_usage 
       WHERE user_id = $1 AND usage_date = $2`,
      [payload.userId, today]
    );

    const usageCount = result.rows[0]?.usage_count || 0;

    return NextResponse.json({ 
      usageToday: usageCount,
      date: today
    }, { status: 200 });

  } catch (error) {
    console.error('Voice usage error:', error);
    return NextResponse.json({ 
      error: 'Failed to get voice usage' 
    }, { status: 500 });
  }
}

// Increment voice usage
export async function POST(request: NextRequest) {
  try {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Increment or create usage record
  await query(
      `INSERT INTO voice_usage (user_id, usage_date, usage_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, usage_date)
       DO UPDATE SET usage_count = voice_usage.usage_count + 1`,
      [payload.userId, today]
    );

    // Get updated count
  const result = await query(
      `SELECT usage_count FROM voice_usage 
       WHERE user_id = $1 AND usage_date = $2`,
      [payload.userId, today]
    );

    return NextResponse.json({ 
      usageToday: result.rows[0].usage_count 
    }, { status: 200 });

  } catch (error) {
    console.error('Voice usage increment error:', error);
    return NextResponse.json({ 
      error: 'Failed to increment voice usage' 
    }, { status: 500 });
  }
}
