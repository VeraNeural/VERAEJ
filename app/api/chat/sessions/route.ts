import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// Get user's chat sessions
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
  const sessions = await db.getUserSessions(payload.userId);
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}

// Delete a session
export async function DELETE(request: NextRequest) {
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
    const { sessionId } = await request.json();
    // Verify session belongs to user
    const session = await db.getSession(sessionId);
    if (!session || session.user_id !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    await db.deleteSession(sessionId);
    return NextResponse.json({ message: 'Session deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
