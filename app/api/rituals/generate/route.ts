import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RITUAL_SYSTEM_PROMPT = `You are VERA's ritual generator. Your job is to create personalized 2-3 minute nervous system rituals.

Guidelines:
- Keep rituals SHORT (150-200 words max)
- Make them immediately actionable (can do right now, wherever they are)
- Use simple, accessible language
- Focus on embodiment and sensation
- No equipment needed
- End with a gentle question or reflection prompt

Ritual structure:
1. Acknowledgment of their state (1 sentence)
2. The practice (3-4 simple steps)
3. What to notice
4. Closing reflection question

State-specific approaches:

ACTIVATED (anxious, overwhelmed, wired):
- Grounding through senses
- Orienting to space
- Exhale-focused breathing
- Boundary awareness
- Weight and pressure

SHUTDOWN (numb, disconnected, collapsed):
- Gentle mobilization
- Curiosity and discovery
- Pleasant sensations
- Safe activation
- Micro-movements

SETTLED (calm, present, regulated):
- Capacity building
- Subtle awareness
- Expansion practices
- Integration
- Embodiment deepening

Make each ritual feel personal, warm, and doable.`;

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { state } = await request.json();

    if (!state || !['activated', 'settled', 'shutdown'].includes(state)) {
      return NextResponse.json(
        { error: 'Valid state required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if ritual already exists for today
    const existingResult = await query(
      `SELECT * FROM daily_rituals WHERE user_id = $1 AND date = $2`,
      [user.userId, today]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({
        ritual: existingResult.rows[0],
      });
    }

    // Get user's name for personalization
    const userResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [user.userId]
    );
    const userName = userResult.rows[0]?.name || 'friend';

    // Get recent rituals to avoid repetition
    const recentResult = await query(
      `SELECT ritual_text FROM daily_rituals 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 7`,
      [user.userId]
    );

    const recentRituals = recentResult.rows.map(r => r.ritual_text).join('\n---\n');

    // Generate ritual with Claude
    const prompt = `Generate a nervous system ritual for someone who is feeling ${state} today.

Their name is ${userName}.

${recentRituals.length > 0 ? `Recent rituals they've done (avoid repetition):\n${recentRituals}\n\n` : ''}

Create a fresh, personalized ritual for their ${state} state. Remember: 150-200 words, immediately actionable, no equipment needed.

Output only the ritual text, no additional formatting or labels.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: RITUAL_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const ritualText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Take three deep breaths. Notice where you are. Feel your body in this moment.';

    // Save ritual to database
    const insertResult = await query(
      `INSERT INTO daily_rituals (user_id, date, nervous_system_state, ritual_text, ritual_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.userId, today, state, ritualText, 'ai_generated']
    );

    // Record check-in
    await query(
      `INSERT INTO daily_check_ins_simple (user_id, date, state)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET state = $3`,
      [user.userId, today, state]
    );

    return NextResponse.json({
      ritual: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Error generating ritual:', error);
    return NextResponse.json(
      { error: 'Failed to generate ritual' },
      { status: 500 }
    );
  }
}
