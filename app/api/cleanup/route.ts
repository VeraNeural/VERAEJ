import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Add authentication here (only allow admin)
    const { secret } = await request.json();
    
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete test data
    await query('DELETE FROM chat_messages WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM users WHERE email LIKE $1', ['%test%']);

    return NextResponse.json({ success: true, message: 'Test data cleaned' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
