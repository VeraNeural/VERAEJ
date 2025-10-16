import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Get all messages in this conversation
    const messagesResult = await query(
      `SELECT 
        dm.id,
        dm.sender_id,
        dm.content,
        dm.created_at,
        dm.is_read,
        u.name as sender_name
       FROM direct_messages dm
       JOIN users u ON dm.sender_id = u.id
       WHERE dm.conversation_id = $1
       AND (dm.sender_id = $2 OR dm.recipient_id = $2)
       ORDER BY dm.created_at ASC`,
      [conversationId, user.userId]
    );

    return NextResponse.json({
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { conversationId, recipientId, content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400 }
      );
    }

    // If starting new conversation (no conversationId), create one
    let finalConversationId = conversationId;
    let finalRecipientId = recipientId;

    if (!finalConversationId && recipientId) {
      // Generate conversation ID
      const { randomUUID } = require('crypto');
      finalConversationId = randomUUID();
    } else if (finalConversationId) {
      // Get recipient from existing conversation
      const recipientResult = await query(
        `SELECT 
          CASE 
            WHEN sender_id = $1 THEN recipient_id
            ELSE sender_id
          END as other_user_id
         FROM direct_messages
         WHERE conversation_id = $2
         LIMIT 1`,
        [user.userId, finalConversationId]
      );
      
      if (recipientResult.rows.length > 0) {
        finalRecipientId = recipientResult.rows[0].other_user_id;
      }
    }

    if (!finalRecipientId) {
      return NextResponse.json(
        { error: 'Recipient required' },
        { status: 400 }
      );
    }

    // Insert message
    const messageResult = await query(
      `INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at`,
      [finalConversationId, user.userId, finalRecipientId, content.trim()]
    );

    return NextResponse.json({
      message: messageResult.rows[0],
      conversationId: finalConversationId,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
