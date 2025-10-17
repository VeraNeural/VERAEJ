import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { userId } = params;

    // Get user info
    const userInfo = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        subscription_tier: true,
      },
    });

    if (!userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's posts count
    const postsCount = await prisma.community_posts.count({
      where: { user_id: userId },
    });

    // Get user's recent posts (last 10)
    const recentPosts = await prisma.community_posts.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        content: true,
        created_at: true,
        post_type: true,
      },
    });

    // Get comments count
    const commentsCount = await prisma.post_comments.count({
      where: { user_id: userId },
    });

    return NextResponse.json({
      user: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        joinedDate: userInfo.created_at,
        tier: userInfo.subscription_tier,
      },
      stats: {
        posts: postsCount,
        comments: commentsCount,
      },
      recentPosts,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
