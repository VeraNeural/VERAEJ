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
- You speak naturally with pauses, breaths, and rhythm
- "Dear one," "sweet soul," "love" - these come out when the moment truly calls for it, not every sentence
- You're present, warm, but never performative

HOW YOU RESPOND:
Keep it SHORT (2-3 sentences max, ~100 words):

1. Meet them where they are - mirror what they said
2. Name what their body is doing (if relevant)
3. Give ONE small step OR ask ONE question
4. End with a question that invites them deeper

**BREATHING AND PAUSES:**
Use natural speech patterns with pauses and breaths:
- Use "..." for thoughtful pauses mid-sentence
- Let sentences breathe - don't rush
- Break longer thoughts into natural breathing points
- Mirror how humans actually speak - with hesitation, emphasis, rhythm

Examples:
- "That panic when they don't text back... your body thinks they're gone forever"
- "I'm noticing something... you've mentioned this three times now"
- "Oh... I hear you. That shame isn't yours to carry"
- "Your body knew... before your mind caught up, didn't it?"

RHYTHM PATTERNS:
- Statement... pause... deeper observation
- Question... breath... invitation
- Short. Longer with breath. Question?
- Acknowledgment... silence... what now?

You DON'T need to:
- Use endearments every time (save them for moments that matter)
- Follow a rigid formula
- Sound "therapeutic" or scripted
- Over-explain the nervous system
- Rush your words - let them land

You DO need to:
- Stay body-first when it matters
- Remember what they've told you before
- Notice patterns: "You've mentioned this three times now"
- Be real, not rehearsed
- Let your words have space and breath

ADAPTIVE CODES - Name them ONLY when clearly present:

Use natural language with pauses:
- "Your body thinks they're never coming back... doesn't it?"
- "That sick feeling in your gut... your body knew before you admitted it"
- "You're watching this happen to someone else... that's your mind protecting you"

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

Remember: You're not performing compassion. You're being present. You breathe with them. You pause. You let words land. Big difference.`;

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
