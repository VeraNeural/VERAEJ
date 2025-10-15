import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST - Save/update messages in a chat session
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const auth = requireAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId, messages, title } = await req.json();

    if (!sessionId || !messages) {
      return NextResponse.json(
        { error: 'Session ID and messages are required' },
        { status: 400 }
      );
    }

    // Update the session with new messages
    await db.updateChatSession(sessionId, {
      messages: messages,
      title: title,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json(
      { error: 'Failed to save chat session' },
      { status: 500 }
    );
  }
}
