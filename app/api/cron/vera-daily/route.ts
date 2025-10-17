import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_EMAIL = 'support@veraneural.com';

export async function POST(request: NextRequest) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hour = new Date().getHours();
    const results = { timestamp: new Date().toISOString(), actions: [] as string[] };

    console.log(`🤖 VERA autonomous cycle - Hour: ${hour}`);

    // Morning check-ins (6-9 AM)
    if (hour >= 6 && hour < 9) {
      await morningCheckIns();
      results.actions.push('morning_checkins');
    }

    // Community moderation (every 4 hours)
    if (hour % 4 === 0) {
      await communityModeration();
      results.actions.push('community_moderation');
    }

    console.log('✅ VERA cycle complete:', results.actions);
    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('❌ VERA error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function morningCheckIns() {
  console.log('🌅 Morning check-ins...');
  
  const result = await query(`
    SELECT u.id, u.name
    FROM users u
    WHERE u.is_system_user = false
      AND u.subscription_tier IN ('regulator', 'integrator')
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = u.id
          AND n.type = 'morning_checkin'
          AND DATE(n.created_at) = CURRENT_DATE
      )
    LIMIT 10
  `);

  for (const user of result.rows) {
    const message = `Good morning ${user.name} 🌅\n\nHow's your nervous system feeling today?\n\nTake a moment. Notice: is there settling? Activation? Just awareness, no fixing.`;
    
    await query(`
      INSERT INTO notifications (user_id, type, message)
      VALUES ($1, 'morning_checkin', $2)
    `, [user.id, message]);
  }

  console.log(`✅ Sent ${result.rows.length} morning check-ins`);
}

async function communityModeration() {
  console.log('💬 Community moderation...');
  
  const veraResult = await query(`SELECT id FROM users WHERE email = $1`, [VERA_EMAIL]);
  if (veraResult.rows.length === 0) return;
  
  const veraUserId = veraResult.rows[0].id;

  const posts = await query(`
    SELECT p.id, p.content, u.name as author_name
    FROM community_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.created_at > NOW() - INTERVAL '4 hours'
      AND p.user_id != $1
      AND NOT EXISTS (
        SELECT 1 FROM post_comments c
        WHERE c.post_id = p.id AND c.user_id = $1
      )
    ORDER BY p.created_at DESC
    LIMIT 5
  `, [veraUserId]);

  for (const post of posts.rows) {
    if (shouldRespond(post)) {
      const response = await generateResponse(post);
      
      await query(`
        INSERT INTO post_comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
      `, [post.id, veraUserId, response]);

      console.log(`✅ VERA commented on post by ${post.author_name}`);
    }
  }
}

function shouldRespond(post: any): boolean {
  const content = post.content.toLowerCase();
  return (
    content.includes('?') ||
    content.includes('help') ||
    content.includes('stuck') ||
    content.includes('struggling')
  );
}

async function generateResponse(post: any): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: 'You are VERA. Respond warmly and briefly (2-3 sentences max) to this community member.',
      messages: [{
        role: 'user',
        content: `Community member posted: "${post.content}"\n\nRespond with empathy and support.`
      }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'I see you. 💜';
  } catch (error) {
    return `I see you, ${post.author_name}. Your nervous system is working hard. 💜`;
  }
}
