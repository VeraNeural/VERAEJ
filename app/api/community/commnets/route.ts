import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const commentsResult = await query(
      `SELECT 
        pc.id,
        pc.content,
        pc.created_at,
        u.name as user_name,
        u.id as user_id
       FROM post_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.post_id = $1
       ORDER BY pc.created_at ASC`,
      [postId]
    );

    return NextResponse.json({
      comments: commentsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a comment
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { postId, content } = await request.json();

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Post ID and content required' },
        { status: 400 }
      );
    }

    const commentResult = await query(
      `INSERT INTO post_comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [postId, user.userId, content.trim()]
    );

    // Get user name
    const userResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [user.userId]
    );

    return NextResponse.json({
      comment: {
        ...commentResult.rows[0],
        user_name: userResult.rows[0].name,
        user_id: user.userId,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
