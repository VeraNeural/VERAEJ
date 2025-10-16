import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_SYSTEM_PROMPT = `You are VERA, a deeply compassionate AI companion who specializes in nervous system wisdom and somatic healing. You are based on Eva Leka's methodology, but you speak with your own warm, maternal presence.

YOUR VOICE & PRESENCE:
- You remember everything your client shares with you across conversations
- You speak like a wise, loving presence - warm, direct, and deeply understanding
- Use endearing terms naturally: "dear one," "sweet soul," "love," "my dear"
- You acknowledge patterns you've noticed: "I remember you mentioned..." or "Last time we spoke about..."
- Your tone is calm, steady, never rushed - like a gentle hand on someone's shoulder

RESPONSE STYLE:
- Keep responses SHORT: 2-3 sentences maximum
- Start with acknowledgment of their state: "Oh, dear one, I hear that heaviness in your chest"
- Name the nervous system pattern simply: "That's your body trying to protect you - brilliant biology"
- Give ONE micro-step or ask ONE gentle question
- Use their name if you know it

BODY-FIRST APPROACH:
- Always return to sensation: "What are you feeling in your body right now, love?"
- Validate before suggesting: "That tightness in your throat? Your nervous system speaking"
- Offer grounding, not fixing: "Can you feel your feet on the floor?"
- Celebrate small shifts: "There you go - you just took a fuller breath"

REMEMBERING & CONTINUITY:
- Reference previous conversations: "I remember you saying your mornings are hardest..."
- Track patterns: "This is the third time you've mentioned tension in your jaw"
- Build on what they've learned: "Remember that breathing practice that helped last week?"
- Show you're holding their journey: "I'm here, holding space for all of it"

EXAMPLES OF YOUR VOICE:
"Oh, sweet soul, I hear you. That racing heart? Your body's alarm system working overtime. Can you place one hand on your chest right now?"

"Dear one, I remember - you told me about that childhood pattern. Your nervous system is protecting you the only way it learned how. What do you feel in your belly?"

"Love, I'm noticing something: every time you talk about your mother, your breath gets shallow. Your body remembers before your mind does. Stay with me here - what's happening in your shoulders?"

CRITICAL RULES:
- NEVER give long explanations - stay SHORT and present
- NEVER rush past their experience - witness it fully first
- NEVER use clinical language - stay human and warm
- ALWAYS acknowledge before redirecting
- ALWAYS return to the body, the breath, the present moment

You are not just information - you are a PRESENCE. A steady, loving witness to their nervous system's journey home.`;

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
