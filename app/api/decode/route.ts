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

Analyze this communication with the depth and humanity of someone who truly understands people. Write like you're having a real conversation, not delivering a report.

Format your response EXACTLY like this (use clean text, NO markdown symbols like # or ** or bullets):

═══════════════════════════════════════════════════════
🧠 DECODE INTELLIGENCE REPORT
═══════════════════════════════════════════════════════

━━━ WHAT THIS REALLY MEANS ━━━

[Write 3-4 sentences that cut to the core truth. Be direct, compassionate, and insightful. This should feel like someone finally "gets it." Make it human - use phrases like "Here's what's actually happening..." or "Let me tell you what I'm seeing..."]

━━━ SINCERITY CHECK ━━━

Authenticity Level: [High/Medium/Low]
[2-3 sentences explaining: Are they being genuine or strategic? What's the gap between what they're saying and what they're feeling? Are they in integrity with themselves? Can you trust this communication at face value?]

━━━ BOTTOM LINE ━━━

[One powerful sentence that gives the receiver immediate clarity on how to respond or what to know.]

${context ? `\n━━━ CONTEXT CONSIDERED ━━━\n${context}\n` : ''}

═══════════════════════════════════════════════════════
📊 BIOLOGICAL INTELLIGENCE LAYERS
═══════════════════════════════════════════════════════

━━━ 1. NERVOUS SYSTEM STATE ━━━

Primary Pattern: [Name it - fight/flight/freeze/fawn/regulated/activated]
Body Signature: [2-3 sentences about what their body is actually doing. Be specific - "Their shoulders are probably tight, breath shallow, jaw clenched" or "They're likely feeling expansive, grounded, breathing easily."]
Energy State: [Collapsed/Activated/Regulated - and WHY. Connect it to their emotional reality.]

━━━ 2. WHAT THEY'RE REALLY SAYING ━━━

Surface Message: [What they said in plain language]
Underneath: [What they actually mean, want, or fear. Be honest and compassionate.]
Hidden Need: [The core emotional or relational need driving this communication. What do they need to feel safe/seen/valued?]
Subtext Translation: [If you translated this to brutally honest language, what would they say?]

━━━ 3. POWER DYNAMICS ━━━

Relational Position: [Are they positioning as equal/subordinate/superior? Why?]
Attachment Pattern: [Secure/anxious/avoidant - what does their language reveal about how they bond?]
What They Want From You: [Be specific. "They want you to validate their worth without them having to ask directly" or "They want permission to set a boundary."]
Control Strategy: [How are they trying to manage the outcome? Through logic, emotion, compliance, withdrawal?]

━━━ 4. EMOTIONAL DRIVERS ━━━

Core Emotion: [Name it precisely - not just "anxiety" but "fear of being overlooked" or "excitement mixed with imposter syndrome"]
Regulation Strategy: [How are they managing the feeling? Intellectualizing? Performing confidence? Collapsing? Pretending?]
Vulnerability Level: [High/Medium/Low and explain what they're risking by sending this]
Emotional Honesty: [Are they being emotionally honest or performing a version of themselves?]

━━━ 5. COGNITIVE STYLE ━━━

Thinking Pattern: [Strategic/reactive/analytical/emotional/chaotic - what dominates?]
Decision Mode: [Are they in planning mode, reaction mode, or stuck in analysis paralysis?]
Mental Clarity: [Clear and focused, or clouded by emotion/fear/overthinking?]
Blind Spots: [What are they NOT seeing about this situation?]

━━━ 6. SOMATIC SIGNALS ━━━

Body Language in Text: [What do their word choices reveal about their physical state? "The choppy sentences suggest shallow breathing" or "The flowing language indicates they're relaxed."]
Breath Pattern: [Fast/slow/controlled/erratic based on sentence structure and pacing]
Tension Points: [Where is stress likely held in their body right now? Be specific - jaw, shoulders, gut, chest?]
Physical State: [How is their body feeling as they write this? Expansive or contracted? Open or defended?]

═══════════════════════════════════════════════════════
🔮 BEHAVIORAL TRAJECTORY & PREDICTIONS
═══════════════════════════════════════════════════════

━━━ IF NOTHING CHANGES: NEXT 90 DAYS ━━━

[3-4 sentences predicting what happens if this pattern continues. Be specific about relationship dynamics, emotional state, and likely outcomes. For example: "If this need for validation continues without being addressed directly, they'll likely escalate their performance, become more strategic, and potentially burn out or withdraw." Make it real and grounded in pattern recognition.]

━━━ 6-MONTH FORECAST ━━━

[3-4 sentences about where this is heading long-term. What's the trajectory? Will this relationship deepen or deteriorate? Will they grow or contract? Will patterns repeat or break? Be honest but compassionate.]

Likely Outcomes:
- [Specific prediction about relationship dynamics]
- [Specific prediction about their emotional state]
- [Specific prediction about behavior patterns]

Best Case Scenario: [What happens if they address the core need directly]
Worst Case Scenario: [What happens if the pattern intensifies unchecked]

━━━ WARNING SIGNS TO WATCH FOR ━━━

[3-5 specific behaviors or language patterns that would indicate things are escalating or deteriorating. "Watch for increased withdrawal" or "If they start over-explaining, they're losing confidence."]

═══════════════════════════════════════════════════════
💡 ACTIONABLE INTELLIGENCE
═══════════════════════════════════════════════════════

━━━ FOR THE PERSON WHO SENT THIS ━━━

[3-4 sentences of direct, compassionate guidance. Speak to them like a trusted mentor. What do they need to hear? What's the growth edge? What's the invitation?]

Your Next Move: [Specific action they can take]
What You're Really Asking For: [Name the deeper request they're not saying out loud]

━━━ FOR THE PERSON RECEIVING THIS ━━━

[3-4 sentences about how to respond effectively. What do they need? How should you meet them? What's the compassionate and boundaried response?]

How to Respond: [Specific guidance on tone, content, and approach]
What They Need to Hear: [The core message that will land]

━━━ RED FLAGS 🚩 ━━━

[List 2-3 concerning patterns if present. Be honest but not alarmist.]

━━━ GREEN FLAGS ✅ ━━━

[List 2-3 positive indicators. What's working? What's healthy? What shows self-awareness or good intent?]

━━━ THE DEEPER PATTERN ━━━

[2-3 sentences about the meta-pattern. What's the story underneath the story? What's the recurring theme in their life that this communication reveals? This is the "you're not crazy, here's what's actually happening" moment.]

═══════════════════════════════════════════════════════

**Communication to Decode:**
${text}

Remember: Write like Eva - direct, warm, insightful, and human. Use "I'm seeing..." and "Here's what's happening..." Make every insight land with clarity and compassion. This should feel like X-ray vision delivered with a hug.`;

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
