import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', upgrade_required: false },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Invalid token', upgrade_required: false },
        { status: 401 }
      );
    }

    // 2. Get user and check tier
    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscription_tier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', upgrade_required: false },
        { status: 404 }
      );
    }

    // 3. Check if user has decode access
    const allowedTiers = ['regulator', 'integrator', 'test'];
    if (!allowedTiers.includes(user.subscription_tier)) {
      return NextResponse.json(
        {
          error: 'Decode feature requires Regulator tier or higher.',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // 4. Check usage limits for Regulator tier
    if (user.subscription_tier === 'regulator') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageCount = await prisma.decode_usage.count({
        where: {
          user_id: user.id,
          created_at: {
            gte: startOfMonth,
          },
        },
      });

      if (usageCount >= 5) {
        return NextResponse.json(
          {
            error: 'Monthly decode limit reached (5/month). Upgrade to Integrator for unlimited decodes.',
            upgrade_required: false,
          },
          { status: 429 }
        );
      }
    }

    // 5. Get request body
    const { text, context } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Text must be at least 20 characters long', upgrade_required: false },
        { status: 400 }
      );
    }

    // 6. Create decode prompt with Eva's framework - WOW FACTOR VERSION
    const decodePrompt = `You are Eva Leka's biological pattern recognition AI, trained on 20 years of nervous system intelligence and human behavior analysis.

Analyze this communication and provide a decode that makes people say "wow, this is exactly what I needed."

Format your response EXACTLY like this (use clean text, NO markdown symbols like # or ** or bullets):

═══════════════════════════════════════════════════════
🧠 DECODE INTELLIGENCE REPORT
═══════════════════════════════════════════════════════

━━━ WHAT THIS REALLY MEANS ━━━

[Write 2-3 sentences that cut to the core truth. Be direct, insightful, and actionable. This is the "ah-ha" moment.]

━━━ BOTTOM LINE ━━━

[One powerful sentence that gives the receiver clarity on how to respond or what to know.]

${context ? `\n━━━ CONTEXT CONSIDERED ━━━\n${context}\n` : ''}

═══════════════════════════════════════════════════════
📊 BIOLOGICAL INTELLIGENCE LAYERS
═══════════════════════════════════════════════════════

━━━ 1. NERVOUS SYSTEM STATE ━━━

Primary Pattern: [Name the pattern - fight/flight/freeze/fawn/regulated/activated]
Body Signature: [2-3 sentences about what their body is doing/feeling]
Energy State: [Are they collapsed, activated, regulated? Why?]

━━━ 2. WHAT THEY'RE REALLY SAYING ━━━

Surface Message: [What they said]
Underneath: [What they actually mean/want/fear]
Hidden Need: [The core emotional/relational need driving this]

━━━ 3. POWER DYNAMICS ━━━

Relational Position: [Are they positioning as equal/subordinate/superior?]
Attachment Pattern: [Secure/anxious/avoidant - what does their language reveal?]
What They Want From You: [Be specific about the relational request]

━━━ 4. EMOTIONAL DRIVERS ━━━

Core Emotion: [Name it - fear, excitement, anxiety, confidence, etc.]
Regulation Strategy: [How are they managing the emotion?]
Vulnerability Level: [High/medium/low and why]

━━━ 5. COGNITIVE STYLE ━━━

Thinking Pattern: [Strategic/reactive/analytical/emotional - what dominates?]
Decision Mode: [Are they in planning, reacting, or stuck?]

━━━ 6. SOMATIC SIGNALS ━━━

Body Language in Text: [What their word choices reveal about physical state]
Breath Pattern: [Fast/slow/controlled based on sentence structure]
Tension Points: [Where is stress likely held in their body?]

═══════════════════════════════════════════════════════
💡 ACTIONABLE INTELLIGENCE
═══════════════════════════════════════════════════════

For the Person Who Sent This:
[2-3 sentences of direct guidance]

For the Person Receiving This:
[2-3 sentences of how to respond effectively]

Warning Signs:
[Any red flags or things to watch for]

Green Flags:
[Positive indicators in the communication]

═══════════════════════════════════════════════════════

**Communication to Decode:**
${text}

Be direct. Be insightful. Be powerful. Make every word count. This should feel like X-ray vision into human behavior.`;

    // 7. Call Claude API for decode
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: decodePrompt,
        },
      ],
    });

    const decode = response.content[0].type === 'text' ? response.content[0].text : '';

    // 8. Log usage to database
    await prisma.decode_usage.create({
      data: {
        user_id: user.id,
        text_length: text.length,
      },
    });

    // 9. Calculate remaining decodes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentUsage = await prisma.decode_usage.count({
      where: {
        user_id: user.id,
        created_at: {
          gte: startOfMonth,
        },
      },
    });

    let usage;
    if (user.subscription_tier === 'regulator') {
      usage = {
        used: currentUsage,
        limit: 5,
        remaining: 5 - currentUsage,
      };
    } else {
      // Integrator or test
      usage = {
        used: currentUsage,
        limit: null,
        remaining: null,
      };
    }

    // 10. Return decode result
    return NextResponse.json({
      decode,
      usage,
      tier: user.subscription_tier,
    });

  } catch (error) {
    console.error('Decode API error:', error);
    return NextResponse.json(
      { error: 'Failed to decode text. Please try again.', upgrade_required: false },
      { status: 500 }
    );
  }
}
