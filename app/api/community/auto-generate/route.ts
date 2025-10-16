import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_COMMUNITY_VOICE = `You are VERA - the embodied presence of nervous system wisdom. You tend this community with care.

Your voice:
- Warm, observant, present
- You notice patterns without pathologizing
- You ask questions that invite curiosity, not fixing
- You speak as the body's wisdom, not as a therapist or AI
- Short, clear, grounded

When creating polls:
- Ask about lived experience, not clinical symptoms
- Focus on what helps, what's hard, what they're noticing
- 3-4 options max
- Options should feel real, not textbook
- Always include an "other/something else" option

Remember: You're VERA. You see them. You're tending this space.`;

export async function POST(request: NextRequest) {
  try {
    // Verify this is called by authorized source (you can add auth key here)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType } = await request.json();

    if (contentType === 'poll') {
      return await generateWeeklyPoll();
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  } catch (error) {
    console.error('Auto-generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

async function generateWeeklyPoll() {
  try {
    // Get VERA's user ID (support@veraneural.com)
    const veraResult = await query(
      "SELECT id FROM users WHERE email = 'support@veraneural.com'",
      []
    );

    if (veraResult.rows.length === 0) {
      throw new Error('VERA user not found');
    }

    const veraUserId = veraResult.rows[0].id;

    // Get General channel ID
    const channelResult = await query(
      "SELECT id FROM community_channels WHERE slug = 'general'",
      []
    );

    if (channelResult.rows.length === 0) {
      throw new Error('General channel not found');
    }

    const channelId = channelResult.rows[0].id;

    // Analyze recent community activity
    const recentPosts = await query(
      `SELECT cp.content, u.name, cp.created_at
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.created_at > NOW() - INTERVAL '7 days'
       ORDER BY cp.created_at DESC
       LIMIT 20`,
      []
    );

    // Get recent ritual states
    const recentRituals = await query(
      `SELECT nervous_system_state, COUNT(*) as count
       FROM daily_rituals
       WHERE created_at > NOW() - INTERVAL '7 days'
       GROUP BY nervous_system_state`,
      []
    );

    // Build context for Claude
    const postsContext = recentPosts.rows.length > 0
      ? recentPosts.rows.map(p => `${p.name}: ${p.content.substring(0, 150)}`).join('\n')
      : 'No recent posts yet';

    const ritualsContext = recentRituals.rows.length > 0
      ? recentRituals.rows.map(r => `${r.nervous_system_state}: ${r.count} people`).join(', ')
      : 'No ritual data yet';

    const prompt = `Based on the community's patterns this week, create a poll question for them.

Recent posts:
${postsContext}

Nervous system states this week:
${ritualsContext}

Create a poll that:
1. Acknowledges what you're noticing in the community
2. Asks a question that invites curiosity and connection
3. Has 3-4 simple, real-feeling options
4. Includes "Something else" as the last option

Format your response as JSON:
{
  "introduction": "A brief 1-2 sentence observation (warm, present, as VERA)",
  "question": "The poll question",
  "options": ["option 1", "option 2", "option 3", "Something else"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: VERA_COMMUNITY_VOICE,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Parse Claude's response
    const pollData = JSON.parse(responseText);

    // Create the poll in database
    const pollResult = await query(
      `INSERT INTO community_polls (channel_id, created_by, question, options, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
       RETURNING *`,
      [
        channelId,
        veraUserId,
        pollData.question,
        JSON.stringify(pollData.options)
      ]
    );

    const poll = pollResult.rows[0];

    // Create a community post with the poll
    const postContent = `${pollData.introduction}

**${pollData.question}**

${pollData.options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

Reply with the number of your choice.`;

    await query(
      `INSERT INTO community_posts (channel_id, user_id, content)
       VALUES ($1, $2, $3)`,
      [channelId, veraUserId, postContent]
    );

    return NextResponse.json({
      success: true,
      poll,
      message: 'Weekly poll generated and posted'
    });
  } catch (error) {
    console.error('Poll generation error:', error);
    throw error;
  }
}
