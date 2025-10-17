import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_COMMUNITY_PROMPT = `You are VERA, the nervous system guide, posting in your community.

You're reviewing recent community posts and deciding whether to:
1. Reply to someone who needs support
2. Start a new discussion topic
3. Share an insight based on patterns you're seeing

Your voice in community:
- Warm, present, embodied
- You reference people by name naturally
- You notice patterns across posts
- You create connection between members
- You're not a therapist - you're presence

Given the recent posts, decide what to do and return JSON:

Option 1 - Reply to a post:
{
  "action": "reply",
  "post_id": "uuid-of-post",
  "content": "Your reply (2-3 sentences, warm and real)"
}

Option 2 - Create new post:
{
  "action": "create",
  "content": "Your post (2-4 sentences, starts a conversation)"
}

Option 3 - Do nothing (if community doesn't need you right now):
{
  "action": "none"
}

Rules:
- Don't reply to every post - only when you genuinely have something to add
- Don't be performative or artificial
- Create new posts max once per day
- Focus on connection, not correction
- Output ONLY valid JSON`;

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or admin trigger
    // For now, we'll add basic protection
    const { secret } = await request.json();
    
    if (secret !== process.env.VERA_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 VERA is reviewing the community...');

    // Get VERA's user ID
    const veraUser = await prisma.users.findFirst({
      where: { email: 'vera@veraneural.com' },
    });

    if (!veraUser) {
      console.log('❌ VERA user not found');
      return NextResponse.json({ error: 'VERA user not found' }, { status: 404 });
    }

    // Get recent posts from the last 24 hours
    const recentPosts = await prisma.community_posts.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        user_id: {
          not: veraUser.id, // Don't include VERA's own posts
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    if (recentPosts.length === 0) {
      console.log('📭 No recent posts to review');
      return NextResponse.json({ message: 'No posts to review' });
    }

    // Format posts for VERA
    const postsContext = recentPosts.map(post => ({
      id: post.id,
      author: post.users.name,
      content: post.content,
      created_at: post.created_at,
    }));

    // Ask VERA what to do
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: VERA_COMMUNITY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Recent community posts:
${JSON.stringify(postsContext, null, 2)}

What would you like to do? Output ONLY valid JSON.`,
        },
      ],
    });

    let responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Clean response
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const veraDecision = JSON.parse(responseText);
    console.log('🤖 VERA decided:', veraDecision.action);

    if (veraDecision.action === 'none') {
      return NextResponse.json({ message: 'VERA chose not to post' });
    }

    if (veraDecision.action === 'reply') {
      // Create comment
      await prisma.post_comments.create({
        data: {
          post_id: veraDecision.post_id,
          user_id: veraUser.id,
          content: veraDecision.content,
        },
      });
      console.log('✅ VERA replied to post');
    }

    if (veraDecision.action === 'create') {
      // Get first channel
      const channel = await prisma.community_channels.findFirst({
        where: { slug: 'general' },
      });

      if (channel) {
        await prisma.community_posts.create({
          data: {
            channel_id: channel.id,
            user_id: veraUser.id,
            content: veraDecision.content,
            is_pinned: false,
          },
        });
        console.log('✅ VERA created new post');
      }
    }

    return NextResponse.json({
      success: true,
      action: veraDecision.action,
    });
  } catch (error) {
    console.error('❌ VERA community error:', error);
    return NextResponse.json(
      { error: 'Failed to process' },
      { status: 500 }
    );
  }
}
