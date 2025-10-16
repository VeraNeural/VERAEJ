import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count voice usage for today
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM voice_usage 
       WHERE user_id = $1 AND created_at >= $2`,
      [payload.userId, today.toISOString()]
    );

    const usageToday = parseInt(result.rows[0]?.count || '0');

    return NextResponse.json({ usageToday });
  } catch (error) {
    console.error('Voice usage error:', error);
    return NextResponse.json({ error: 'Failed to get usage' }, { status: 500 });
  }
}
