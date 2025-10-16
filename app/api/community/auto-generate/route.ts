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

Remember: You're VERA. You see them. You're tending this space.`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'vera-auto-2025-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType } = await request.json();

    switch (contentType) {
      case 'poll':
        return await generateWeeklyPoll();
      case 'protocol':
        return await generateProtocolPost();
      case 'reflection':
        return await generateReflectionPrompt();
      case 'summary':
        return await generateMonthlySummary();
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auto-generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

async function getVERAContext() {
  // Get VERA's user ID
  const veraResult = await query(
    "SELECT id FROM users WHERE email = 'support@veraneural.com'",
    []
  );

  if (veraResult.rows.length === 0) {
    throw new Error('VERA user not found');
  }

  // Get General channel ID
  const channelResult = await query(
    "SELECT id FROM community_channels WHERE slug = 'general'",
    []
  );

  if (channelResult.rows.length === 0) {
    throw new Error('General channel not found');
  }

  return {
    veraUserId: veraResult.rows[0].id,
    channelId: channelResult.rows[0].id
  };
}

async function getCommunityPatterns() {
  // Recent posts
  const recentPosts = await query(
    `SELECT cp.content, u.name, cp.created_at
     FROM community_posts cp
     JOIN users u ON cp.user_id = u.id
     WHERE cp.created_at > NOW() - INTERVAL '7 days'
     ORDER BY cp.created_at DESC
     LIMIT 30`,
    []
  );

  // Recent ritual states
  const recentRituals = await query(
    `SELECT nervous_system_state, COUNT(*) as count
     FROM daily_rituals
     WHERE created_at > NOW() - INTERVAL '7 days'
     GROUP BY nervous_system_state`,
    []
  );

  // Completion rates
  const completionRate = await query(
    `SELECT 
       COUNT(CASE WHEN completed = true THEN 1 END)::float / COUNT(*)::float * 100 as rate
     FROM daily_rituals
     WHERE created_at > NOW() - INTERVAL '7 days'`,
    []
  );

  return {
    posts: recentPosts.rows,
    rituals: recentRituals.rows,
    completionRate: completionRate.rows[0]?.rate || 0
  };
}

async function generateWeeklyPoll() {
  const { veraUserId, channelId } = await getVERAContext();
  const patterns = await getCommunityPatterns();

  const postsContext = patterns.posts.length > 0
    ? patterns.posts.map(p => `${p.name}: ${p.content.substring(0, 150)}`).join('\n')
    : 'Community is just getting started';

  const ritualsContext = patterns.rituals.length > 0
    ? patterns.rituals.map(r => `${r.nervous_system_state}: ${r.count} people`).join(', ')
    : 'New rituals emerging';

  const prompt = `Based on the community's patterns this week, create a poll question.

Recent posts:
${postsContext}

Nervous system states this week:
${ritualsContext}

Create a poll that:
1. Acknowledges what you're noticing (1-2 sentences, warm)
2. Asks a question that invites curiosity and connection
3. Has 3-4 simple, real-feeling options
4. Includes "Something else" as the last option

Format as JSON:
{
  "introduction": "Your observation",
  "question": "The poll question",
  "options": ["option 1", "option 2", "option 3", "Something else"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: VERA_COMMUNITY_VOICE,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const pollData = JSON.parse(responseText);

  await query(
    `INSERT INTO community_polls (channel_id, created_by, question, options, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
    [channelId, veraUserId, pollData.question, JSON.stringify(pollData.options)]
  );

  const postContent = `${pollData.introduction}

**${pollData.question}**

${pollData.options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

Reply with the number of your choice.`;

  await query(
    `INSERT INTO community_posts (channel_id, user_id, content) VALUES ($1, $2, $3)`,
    [channelId, veraUserId, postContent]
  );

  return NextResponse.json({ success: true, type: 'poll' });
}

async function generateProtocolPost() {
  const { veraUserId, channelId } = await getVERAContext();
  const patterns = await getCommunityPatterns();

  const dominantState = patterns.rituals.length > 0
    ? patterns.rituals.reduce((prev, current) => 
        (current.count > prev.count) ? current : prev
      ).nervous_system_state
    : 'settled';

  const prompt = `The community has been experiencing mostly ${dominantState} states this week.

Create a short, practical protocol (200-250 words) for this state.

The protocol should:
- Start with a brief acknowledgment of the state
- Offer 3-4 specific, doable practices
- End with a gentle reminder or encouragement
- Feel like VERA speaking - warm, embodied, wise

Write it as a complete post, ready to share.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: VERA_COMMUNITY_VOICE,
    messages: [{ role: 'user', content: prompt }],
  });

  const protocolText = response.content[0].type === 'text' ? response.content[0].text : '';

  await query(
    `INSERT INTO community_posts (channel_id, user_id, content) VALUES ($1, $2, $3)`,
    [channelId, veraUserId, protocolText]
  );

  return NextResponse.json({ success: true, type: 'protocol' });
}

async function generateReflectionPrompt() {
  const { veraUserId, channelId } = await getVERAContext();
  const patterns = await getCommunityPatterns();

  const prompt = `It's Friday. Create a reflection prompt for the community to close their week.

Based on this week's patterns:
- ${patterns.posts.length} community posts
- ${patterns.completionRate.toFixed(0)}% ritual completion rate
- States: ${patterns.rituals.map(r => r.nervous_system_state).join(', ')}

Create a warm, brief reflection prompt (100-150 words) that:
- Acknowledges the week
- Invites them to notice something
- Doesn't require a big answer
- Feels like a gentle close

Write as VERA, ready to post.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: VERA_COMMUNITY_VOICE,
    messages: [{ role: 'user', content: prompt }],
  });

  const reflectionText = response.content[0].type === 'text' ? response.content[0].text : '';

  await query(
    `INSERT INTO community_posts (channel_id, user_id, content) VALUES ($1, $2, $3)`,
    [channelId, veraUserId, reflectionText]
  );

  return NextResponse.json({ success: true, type: 'reflection' });
}

async function generateMonthlySummary() {
  const { veraUserId, channelId } = await getVERAContext();

  // Get month's data
  const monthPosts = await query(
    `SELECT COUNT(*) as count FROM community_posts 
     WHERE created_at > DATE_TRUNC('month', NOW())`,
    []
  );

  const monthRituals = await query(
    `SELECT nervous_system_state, COUNT(*) as count
     FROM daily_rituals
     WHERE created_at > DATE_TRUNC('month', NOW())
     GROUP BY nervous_system_state`,
    []
  );

  const prompt = `Create a monthly community summary.

This month:
- ${monthPosts.rows[0].count} posts
- Rituals: ${monthRituals.rows.map(r => `${r.count} ${r.nervous_system_state}`).join(', ')}

Write a warm 200-word reflection on:
- Patterns you noticed
- What the community is learning together
- An invitation for the month ahead

As VERA - observant, warm, grounded.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: VERA_COMMUNITY_VOICE,
    messages: [{ role: 'user', content: prompt }],
  });

  const summaryText = response.content[0].type === 'text' ? response.content[0].text : '';

  await query(
    `INSERT INTO community_posts (channel_id, user_id, content) VALUES ($1, $2, $3)`,
    [channelId, veraUserId, summaryText]
  );

  return NextResponse.json({ success: true, type: 'summary' });
}
