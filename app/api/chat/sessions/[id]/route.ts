import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Verify session belongs to user
    const session = await db.getSession(id);
    if (!session || session.user_id !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const messages = await db.getSessionMessages(id);
    return NextResponse.json({ session, messages }, { status: 200 });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}
