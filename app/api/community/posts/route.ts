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
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    // Get posts with user names
    const postsResult = await query(
      `SELECT 
        cp.id,
        cp.content,
        cp.created_at,
        cp.is_pinned,
        u.name as user_name,
        u.id as user_id
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.channel_id = $1
       ORDER BY cp.is_pinned DESC, cp.created_at DESC
       LIMIT 50`,
      [channelId]
    );

    return NextResponse.json({
      posts: postsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
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

    const { channelId, content } = await request.json();

    if (!channelId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Channel ID and content required' },
        { status: 400 }
      );
    }

    // Create post
    const postResult = await query(
      `INSERT INTO community_posts (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [channelId, user.userId, content.trim()]
    );

    return NextResponse.json({
      post: postResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
