import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all conversations for this user with last message and unread count
    const conversationsResult = await query(
      `SELECT 
        dm.conversation_id,
        CASE 
          WHEN dm.sender_id = $1 THEN dm.recipient_id
          ELSE dm.sender_id
        END as other_user_id,
        CASE 
          WHEN dm.sender_id = $1 THEN recipient.name
          ELSE sender.name
        END as other_user_name,
        last_msg.content as last_message,
        last_msg.created_at as last_message_time,
        COALESCE(unread.count, 0) as unread_count
       FROM (
         SELECT DISTINCT conversation_id, sender_id, recipient_id
         FROM direct_messages
         WHERE sender_id = $1 OR recipient_id = $1
       ) dm
       JOIN users sender ON dm.sender_id = sender.id
       JOIN users recipient ON dm.recipient_id = recipient.id
       LEFT JOIN LATERAL (
         SELECT content, created_at
         FROM direct_messages
         WHERE conversation_id = dm.conversation_id
         ORDER BY created_at DESC
         LIMIT 1
       ) last_msg ON true
       LEFT JOIN LATERAL (
         SELECT COUNT(*) as count
         FROM direct_messages
         WHERE conversation_id = dm.conversation_id
         AND recipient_id = $1
         AND is_read = false
       ) unread ON true
       ORDER BY last_msg.created_at DESC`,
      [user.userId]
    );

    return NextResponse.json({
      conversations: conversationsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
