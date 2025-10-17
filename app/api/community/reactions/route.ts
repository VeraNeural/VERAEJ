import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Fetch reactions for a post
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

    // Get all reactions for this post grouped by type
    const reactions = await prisma.post_reactions.groupBy({
      by: ['reaction_type'],
      where: { post_id: postId },
      _count: {
        id: true,
      },
    });

    // Check if current user has reacted
    const userReaction = await prisma.post_reactions.findFirst({
      where: {
        post_id: postId,
        user_id: user.userId,
      },
    });

    return NextResponse.json({
      reactions: reactions.map(r => ({
        type: r.reaction_type,
        count: r._count.id,
      })),
      userReaction: userReaction?.reaction_type || null,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

// POST - Add or toggle a reaction
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { postId, reactionType } = await request.json();

    if (!postId || !reactionType) {
      return NextResponse.json(
        { error: 'Post ID and reaction type required' },
        { status: 400 }
      );
    }

    // Check if user already reacted
    const existing = await prisma.post_reactions.findFirst({
      where: {
        post_id: postId,
        user_id: user.userId,
      },
    });

    if (existing) {
      // If same reaction, remove it (toggle off)
      if (existing.reaction_type === reactionType) {
        await prisma.post_reactions.delete({
          where: { id: existing.id },
        });
        return NextResponse.json({ removed: true });
      } else {
        // If different reaction, update it
        await prisma.post_reactions.update({
          where: { id: existing.id },
          data: { reaction_type: reactionType },
        });
        return NextResponse.json({ updated: true });
      }
    }

    // Create new reaction
    await prisma.post_reactions.create({
      data: {
        post_id: postId,
        user_id: user.userId,
        reaction_type: reactionType,
      },
    });

    return NextResponse.json({ created: true });
  } catch (error) {
    console.error('Error managing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to manage reaction' },
      { status: 500 }
    );
  }
}
