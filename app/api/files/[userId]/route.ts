import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/files/:userId - List user's files
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}