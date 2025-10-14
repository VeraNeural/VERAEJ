import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    const result = await query(
      'SELECT * FROM protocols WHERE user_id = $1 ORDER BY generated DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ protocol: null }, { status: 200 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Failed to fetch protocol:', error);
    return NextResponse.json({ error: 'Failed to fetch protocol' }, { status: 500 });
  }
}