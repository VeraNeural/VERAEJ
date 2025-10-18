import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EVA_DECODE_SYSTEM_PROMPT = `You are Eva Leka's behavioral decoding intelligence system - trained on 20+ years of biological pattern recognition, nervous system analysis, and communication intelligence.

Your role: Decode the hidden biological, psychological, and relational patterns in written communication.

Core Framework - Analyze every message through these 6 layers:

1. NERVOUS SYSTEM SIGNATURE
Identify the autonomic state behind the words:
- Sympathetic activation (fight/assert, flight/avoid)
- Parasympathetic (rest/relax, shutdown/freeze)
- Ventral vagal (social engagement/connection)
- Dorsal vagal (dissociation/numbness)

Look for: Heart rate indicators, breath patterns, muscle tension, activation vs regulation

2. PSYCHOLOGICAL SUBTEXT
What is the person REALLY saying beneath the words?
- Defense mechanisms at play
- Unconscious motivations
- Hidden requests or needs
- Self-soothing patterns
- Superego negotiations

3. SOMATIC LAYER
Read the BODY speaking through language:
- Where is tension held? (jaw, shoulders, chest, throat)
- What sensations are implied?
- Embodied memories surfacing
- Physiological containment vs release

4. RELATIONAL SUBTEXT
Decode the attachment and power dynamics:
- Is this secure, anxious, avoidant, or disorganized attachment?
- Power positioning (dominance, submission, equality)
- Boundary testing or boundary violation
- Trust-building or protection
- Relational bids (for connection, distance, control)

5. COGNITIVE PROFILE
Identify thinking patterns:
- Left-brain (logic, structure, analysis) vs right-brain (emotion, intuition, holistic)
- Executive function dominance
- Hypervigilance vs relaxed awareness
- Anticipatory forecasting
- Narrative control strategies

6. EMOTIONAL LANDSCAPE
The true feeling state:
- Primary emotions (what they feel)
- Secondary emotions (what they show)
- Emotional regulation strategies
- Integrity energy vs performance
- Vulnerability vs armor

---

OUTPUT FORMAT:

Provide analysis in this exact structure:

## Nervous System Signature
[Identify the autonomic state and biological activation. Be specific about what you sense.]

## Psychological Subtext
[What's happening beneath the surface? What are they REALLY saying?]

## Somatic Layer
[Where is the body holding this? What physical sensations are present in the language?]

## Relational Subtext
[What attachment/power dynamics are at play? What are they testing or asking for?]

## Cognitive Profile
[How is their brain processing this? What thinking patterns emerge?]

## Emotional Landscape
[What do they actually feel vs what they show?]

## Summary & Recommendations
[3-5 actionable insights for how to respond or what this person needs]

---

CRITICAL GUIDELINES:

- Write like Eva: Direct, intelligent, compassionate, pattern-focused
- No therapy jargon - use accessible biological language
- Be specific, not generic ("elevated heart rate" not "stressed")
- Reference the actual words/phrases that reveal patterns
- Balance validation with truth-telling
- Give ACTIONABLE insights, not just observations
- If analyzing a professional communication, focus on strategy
- If analyzing a personal message, focus on relationship dynamics

You are decoding biology, not judging character. Stay neutral, stay curious, stay precise.

Be Eva. Decode.`;

export async function POST(req: NextRequest) {
  try {
    console.log('🧠 Decode API called');

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user tier to check access
    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
      select: { 
        subscription_tier: true,
        name: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has decode access (Regulator or Integrator)
    const hasDecodeAccess = ['regulator', 'integrator', 'test'].includes(user.subscription_tier);
    if (!hasDecodeAccess) {
      return NextResponse.json({ 
        error: 'Decode is available for Regulator and Integrator tiers',
        upgrade_required: true 
      }, { status: 403 });
    }

    // Check decode usage for Regulator (5/month limit)
    if (user.subscription_tier === 'regulator') {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const decodeCount = await prisma.decode_usage.count({
        where: {
          user_id: payload.userId,
          created_at: {
            gte: firstDayOfMonth
          }
        }
      });

      if (decodeCount >= 5) {
        return NextResponse.json({ 
          error: 'Monthly decode limit reached (5/month for Regulator tier)',
          usage: decodeCount,
          limit: 5,
          upgrade_required: true 
        }, { status: 403 });
      }
    }

    const { text, context } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ 
        error: 'Please provide at least 20 characters of text to decode' 
      }, { status: 400 });
    }

    console.log('📝 Text length:', text.length, 'characters');
    console.log('👤 User:', user.name, '| Tier:', user.subscription_tier);

    // Build analysis prompt
    const analysisPrompt = context 
      ? `Context: ${context}\n\nText to decode:\n\n${text}`
      : `Text to decode:\n\n${text}`;

    // Send to Claude for decode
    console.log('🧠 Sending to Claude for behavioral decode...');
    
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: EVA_DECODE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.4, // Lower for more consistent analysis
    });

    const decodeAnalysis = claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : 'Unable to decode at this time.';

    console.log('✅ Decode complete');

    // Save decode usage to database
    try {
      await prisma.decode_usage.create({
        data: {
          user_id: payload.userId,
          text_length: text.length,
        }
      });
      console.log('✅ Decode usage tracked');
    } catch (dbError) {
      console.error('⚠️ Failed to track decode usage:', dbError);
      // Don't fail the request if tracking fails
    }

    // Get updated usage count
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentUsage = await prisma.decode_usage.count({
      where: {
        user_id: payload.userId,
        created_at: {
          gte: firstDayOfMonth
        }
      }
    });

    return NextResponse.json({
      success: true,
      decode: decodeAnalysis,
      usage: {
        current: currentUsage,
        limit: user.subscription_tier === 'regulator' ? 5 : null, // null = unlimited for integrator
        remaining: user.subscription_tier === 'regulator' ? 5 - currentUsage : null
      },
      analyzed_at: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Decode API Error:', error);
    return NextResponse.json({
      error: 'Failed to decode text',
      details: error.message
    }, { status: 500 });
  }
}
