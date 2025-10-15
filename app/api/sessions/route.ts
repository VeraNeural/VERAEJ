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

// POST - Save/update messages in an existing session
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

    console.log('💾 Save API called:', { sessionId, messageCount: messages?.length, title });

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the session to verify ownership
    const session = await db.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the session with messages
    await db.updateChatSession(sessionId, {
      messages,
      title: title || session.title,
      updated_at: new Date()
    });

    console.log('✅ Messages saved successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Session saved successfully' 
    });
  } catch (error) {
    console.error('❌ Save session error:', error);
    return NextResponse.json(
      { error: 'Failed to save chat session' },
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
