import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Get all chat sessions for the current user
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const auth = requireAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's chat sessions
    const sessions = await db.getChatSessions(auth.userId);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
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

    const { title } = await req.json();

    // Create new session
    const session = await db.createChatSession(auth.userId, title || 'New Chat');

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const auth = requireAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

  // Delete session
  await db.deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}