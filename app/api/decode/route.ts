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

    // 6. Create decode prompt with Eva's framework
    const decodePrompt = `You are an expert in biological pattern recognition and nervous system analysis, trained in Eva Leka's 20-year framework for decoding human communication.

Analyze the following communication and provide a comprehensive decode covering these layers:

1. **Nervous System Signature** - Identify the autonomic state (sympathetic/parasympathetic activation, fight/flight/freeze/fawn patterns)

2. **Psychological Subtext** - What's being communicated beneath the surface words

3. **Somatic Layer** - Body-based signals and physiological patterns evident in the language

4. **Relational Dynamics** - Power dynamics, attachment patterns, and relational positioning

5. **Cognitive Profile** - Thinking patterns, decision-making style, and mental processing

6. **Emotional Landscape** - Core emotions, regulation strategies, and emotional drivers

${context ? `\n**Context Provided:** ${context}\n` : ''}

**Communication to Decode:**
${text}

Provide a detailed, professional analysis that reads like a biological intelligence report. Be specific, insightful, and actionable. Format with clear sections and natural language.`;

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
