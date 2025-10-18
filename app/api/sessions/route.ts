import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET - Fetch all chat sessions for the authenticated user
// GET - Fetch all chat sessions OR a specific session by ID
export async function GET(request: NextRequest) {
  try {
    console.log('📨 Fetching chat sessions');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      console.error('❌ No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      console.error('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('✅ User authenticated:', payload.userId);

    // Check if requesting a specific session
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    // If session ID provided, return that specific session with messages
    if (sessionId) {
      console.log('📨 Fetching specific session:', sessionId);
      
      const session = await prisma.chat_sessions.findUnique({
        where: { id: sessionId },
        include: {
          chat_messages: {
            orderBy: {
              created_at: 'asc',
            },
            select: {
              role: true,
              content: true,
              audio_url: true,
            }
          }
        }
      });

      if (!session) {
        console.error('❌ Session not found');
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.user_id !== payload.userId) {
        console.error('❌ Unauthorized: Session does not belong to user');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Format messages for chat
      const messages = session.chat_messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        audioUrl: msg.audio_url || undefined,
      }));

      console.log('✅ Found session with', messages.length, 'messages');

      return NextResponse.json({ 
        session: {
          id: session.id,
          title: session.title,
          messages: messages,
        }
      }, { status: 200 });
    }

    // Otherwise, return all sessions (list view)
    const sessions = await prisma.chat_sessions.findMany({
      where: {
        user_id: payload.userId,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 50, // Get last 50 sessions
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
      }
    });

    console.log('✅ Found', sessions.length, 'sessions');

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to fetch sessions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific chat session and all its messages
export async function DELETE(request: NextRequest) {
  try {
    console.log('📨 Deleting chat session');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      console.error('❌ No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      console.error('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('✅ User authenticated:', payload.userId);

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      console.error('❌ No session ID provided');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log('🗑️ Deleting session:', sessionId);

    // Verify the session belongs to the user
    const session = await prisma.chat_sessions.findUnique({
      where: { id: sessionId },
      select: { user_id: true }
    });

    if (!session) {
      console.error('❌ Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== payload.userId) {
      console.error('❌ Unauthorized: Session does not belong to user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all messages in the session first
    await prisma.chat_messages.deleteMany({
      where: { session_id: sessionId },
    });

    console.log('✅ Deleted all messages for session');

    // Delete the session itself
    await prisma.chat_sessions.delete({
      where: { id: sessionId },
    });

    console.log('✅ Session deleted successfully');

    return NextResponse.json({ success: true, message: 'Session deleted' }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to delete session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    console.log('📨 Creating new chat session');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      console.error('❌ No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      console.error('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('✅ User authenticated:', payload.userId);

    const { title } = await request.json();

    // Create new session
    const session = await prisma.chat_sessions.create({
      data: {
        user_id: payload.userId,
        title: title || 'New conversation',
      }
    });

    console.log('✅ Created new session:', session.id);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to create session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
