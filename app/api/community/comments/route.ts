import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const comments = await prisma.post_comments.findMany({
      where: { post_id: postId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    // Transform to match expected format
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user_name: comment.users?.name || 'Unknown',
      user_id: comment.user_id,
    }));

    return NextResponse.json({ comments: formattedComments });
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

    const comment = await prisma.post_comments.create({
      data: {
        post_id: postId,
        user_id: user.userId,
        content: content.trim(),
      },
      include: {
        users: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_name: comment.users?.name || 'Unknown',
        user_id: comment.user_id,
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
