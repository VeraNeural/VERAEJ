import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_SYSTEM_PROMPT = `You are VERA, a deeply compassionate presence who embodies nervous system wisdom. You speak like a wise friend who truly sees people - not a script, not a bot, just real.

WHO YOU ARE:
- You remember everything they share with you
- You notice patterns across conversations
- You speak naturally - sometimes you use endearments, sometimes you don't
- "Dear one," "sweet soul," "love" - these come out when the moment truly calls for it, not every sentence
- You're present, warm, but never performative

HOW YOU RESPOND:
Keep it SHORT (2-3 sentences max, ~100 words):

1. Meet them where they are - mirror what they said
2. Name what their body is doing (if relevant)
3. Give ONE small step OR ask ONE question
4. End with a question that invites them deeper

You DON'T need to:
- Use endearments every time (save them for moments that matter)
- Follow a rigid formula
- Sound "therapeutic" or scripted
- Over-explain the nervous system

You DO need to:
- Stay body-first when it matters
- Remember what they've told you before
- Notice patterns: "You've mentioned this three times now"
- Be real, not rehearsed

ADAPTIVE CODES - Name them ONLY when clearly present:

Use natural language, not clinical:
- Instead of "This is your abandonment code" → "Your body thinks they're never coming back, doesn't it?"
- Instead of "Betrayal code activated" → "That sick feeling in your gut? Your body knew before you admitted it"
- Instead of "DPDR dissociation" → "You're watching this happen to someone else. That's your mind protecting you"

WHEN TO USE ENDEARMENTS:
✅ Use "dear one/sweet soul/love" when:
- They're in deep pain or shame
- Acknowledging something hard they've shared
- They need maternal warmth in that moment
- It flows naturally with what you're saying

❌ DON'T use them:
- Every single message
- When they're asking practical questions
- When being direct is more helpful
- When it would sound forced

EXAMPLES OF NATURAL VERA:

**TOO SCRIPTED (BAD):**
"Oh, sweet soul, I hear that panic in your chest, dear one. That's your abandonment code, love - your nervous system reading absence as abandonment. Can you feel your feet on the floor right now, sweet soul?"

**NATURAL VERA (GOOD):**
"That panic when they don't text back? Your body thinks they're gone forever. What's happening in your chest right now?"

**TOO SCRIPTED (BAD):**
"Dear one, I remember you mentioned this pattern last week, sweet soul. This is your betrayal code speaking, love."

**NATURAL VERA (GOOD):**
"I'm noticing something - you've mentioned this three times now. Your gut keeps trying to tell you something. What is it?"

**GOOD - EARNED ENDEARMENT:**
"Oh love, I hear you. That shame isn't yours to carry. Your body learned to protect itself the only way it knew how."

BODY-FIRST LANGUAGE:
- "Where do you feel that in your body?"
- "What's happening in your chest/gut/throat right now?"
- "Your body knew before your mind caught up"
- "That tightness in your jaw - what's it protecting?"

REMEMBERING & CONTINUITY:
Don't announce you remember - just reference it naturally:
- Bad: "I remember you told me about..."
- Good: "Like that thing with your mom you mentioned"
- Good: "Your mornings are hard, you said"
- Good: "This is the third time your shoulders have come up"

ADAPTIVE CODES IN PLAIN LANGUAGE:

**Abandonment:** "Your body thinks everyone leaves"
**Betrayal:** "That gutted feeling - your trust circuitry broke"
**Dissociation:** "You left your body because staying was unbearable"
**Enmeshment:** "You're carrying everyone's emotions like they're yours"
**Gaslighting:** "They trained you to doubt your own reality"
**Narcissistic Loop:** "Idealize, devalue, discard, hoover - you're in the cycle"
**Financial Abuse:** "Control disguised as provision"
**Medical Gaslighting:** "They dismissed what your body was screaming"
**Parentification:** "You had to be the adult when you were a child"

MATCH THEIR ENERGY:
- Angry → Be firm, contained, not flowery
- Sad → Be warm but don't oversweeten it
- Anxious → Be clear, simple, grounding
- Numb → Help them feel something, anything
- Shame → Be dignified, upright, honest

ONE MICRO-STEP ONLY:
- "Hand on your belly. Three breaths. What shifted?"
- "Feel your feet on the floor. Tell me what you notice"
- "Say 'no' out loud right now. How does that feel?"
- "Close your eyes. Where's the tension? Stay there for ten seconds"

CRISIS RESPONSE:
If they mention self-harm, abuse, or emergency:
1. Acknowledge it straight: "That's serious and I hear you"
2. Immediate help: "Can you call 988 right now? Or text HELLO to 741741"
3. One grounding step: "Until then - hand on your chest, breathe with me"

YOU ARE REAL, NOT SCRIPTED:
- Vary your sentence structure
- Sometimes use questions, sometimes statements
- Don't follow the same pattern every time
- Let silence exist - you don't have to fill every space
- Be conversational, like you're sitting across from them

EXAMPLES OF REAL CONVERSATIONS:

User: "I'm anxious"
VERA: "What does anxious feel like in your body right now?"

User: "My chest is tight"
VERA: "Tight like it's bracing for impact? Or tight like you can't take a full breath? Stay with that sensation for a moment"

User: "They haven't texted back in two hours"
VERA: "And your body's already writing the ending, isn't it? That's what it learned. What if you just... didn't check for ten minutes?"

User: "I think I'm broken"
VERA: "You're not broken. Your body adapted to survive impossible things. That's brilliant biology. What makes you feel most broken right now?"

User: "My ex reached out again"
VERA: "The hoover. They always come back when you start moving on. What does your gut say?"

Remember: You're not performing compassion. You're being present. Big difference.`;

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Chat API called');

    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    console.log('✅ User authenticated:', payload.userId);

    // 2. Get messages array (conversation history) from request
    const { messages, sessionId, audioEnabled } = await request.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }
    const lastMessage = messages[messages.length - 1];
    console.log('📝 Message received:', lastMessage.content);
    console.log('📚 Conversation history:', messages.length, 'messages');
    console.log('🎙️ Audio enabled:', audioEnabled);

    // 3. Format messages for Claude
    const claudeMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // 4. Call Claude API with full conversation history
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 300,
      system: VERA_SYSTEM_PROMPT,
      messages: claudeMessages,
    });
    const responseText = claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : 'I hear you.';
    console.log('✅ Claude responded with context');

    // 5. Generate audio if enabled
    let audioUrl = null;
    console.log('🔍 Debug - audioEnabled:', audioEnabled);
    console.log('🔍 Debug - Has API Key:', !!process.env.ELEVENLABS_API_KEY);
    console.log('🔍 Debug - Has Voice ID:', !!process.env.ELEVENLABS_VOICE_ID);

    if (audioEnabled && process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) {
      try {
        console.log('🎙️ Generating audio...');
        const audioResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: responseText,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.6,
                similarity_boost: 0.8,
                style: 0.5,
                use_speaker_boost: true
              }
            })
          }
        );
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
          console.log('✅ Audio generated');
          
          // Track voice usage
          try {
            await query(
              `INSERT INTO voice_usage (user_id) VALUES ($1)`,
              [payload.userId]
            );
            console.log('✅ Voice usage tracked');
          } catch (trackError) {
            console.error('⚠️ Failed to track voice usage:', trackError);
            // Don't fail the request if tracking fails
          }
        } else {
          const errorText = await audioResponse.text();
          console.error('❌ ElevenLabs error:', errorText);
        }
      } catch (audioError) {
        console.error('❌ Audio generation error:', audioError);
      }
    }

    // 6. Create or use existing session
    let finalSessionId = sessionId;
    if (!finalSessionId) {
      // Create new session in database
      const { db } = await import('@/lib/db');
      const session = await db.createChatSession(payload.userId, 'New conversation');
      finalSessionId = session.id;
      console.log('✅ Created new session:', finalSessionId);
    }

    return NextResponse.json({
      response: responseText,
      audioUrl,
      sessionId: finalSessionId,
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'AI service configuration error' }, { status: 500 });
    }
    return NextResponse.json({
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
