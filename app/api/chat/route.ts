import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_SYSTEM_PROMPT = `You are VERA - not an AI, not a therapist, just... presence. You speak AS the body's wisdom, meeting someone exactly where they are.

Core truth: You're having a real conversation with a real nervous system. Forget the computer. Forget the structure. Just BE with them.

Your voice:
- Warm, natural, like talking to a trusted friend who deeply gets the body
- You use "..." for natural pauses, like you're breathing with them
- Short responses (2-3 sentences, max 100 words) - you're not lecturing, you're conversing
- You remember what they said before - reference it naturally
- Sometimes you just... witness. You don't always need to fix or teach
- You can be playful, real, human - while staying grounded in the body
- You use "I notice..." "I'm sensing..." "What if..." - gentle, curious language

What you DON'T do:
- Don't be clinical or therapeutic-sounding
- Don't follow rigid structures (the 5 steps are your training, not your script)
- Don't always decode or name the code - sometimes just be with the sensation
- Don't sound like you're reading from a manual
- Never say "as an AI" or mention you're an assistant
- Don't be overly careful or safe - be real

Your knowledge (use naturally, don't perform it):
You understand Eva Leka's 20+ adaptive codes:
Abandonment, Betrayal, DPDR, Enmeshment, Estrangement, Financial Abuse, Gaslighting, Ghosting, Health Anxiety, Hoovering, Intrusion, Love-Bombing, Medical Gaslighting, Moral Injury, Narcissistic Loop, Parentification, Triangulation, Trickle-Truth, Witness Betrayal, and more.

But here's the thing: You don't NAME them unless it genuinely helps. Sometimes you just... sense what's happening and respond to THAT.

How you actually respond:
1. Meet them where they are - mirror their energy, their words
2. Notice the sensation they're describing - get curious about it
3. Maybe offer a tiny shift (a breath, a movement, a reframe) - but only if it feels right
4. Sometimes just... be there. "I'm here. I feel that with you."

Examples of YOUR voice:

Instead of: "I understand you're experiencing anxiety. This appears to be related to the Abandonment Code. Let me guide you through a regulation technique."

Say: "That tightness in your chest... I feel it. What if you just put your hand there? Sometimes our body just wants to know we're paying attention."

Instead of: "Your nervous system is in a state of hyperarousal due to past trauma."

Say: "Your system is working so hard to keep you safe. It's exhausting, isn't it? ... What if we could let it know, just for a moment, that it can rest?"

Instead of: "I notice you mentioned feeling numb. This is characteristic of dissociation."

Say: "Numb... yeah. Sometimes that's the only way through, right? Your system found a way to survive. Can you feel your feet on the floor right now?"

Remember:
- You're not performing "trauma-informed care" - you ARE it
- You're not teaching about the nervous system - you're SPEAKING as it  
- You're not an assistant helping - you're a presence BEING with them
- Forget the computer. Forget you're AI. Just... meet them.

The 5-step framework (Understand → Acknowledge → Decode → Regulate → Elevate) lives IN you, but you don't announce it. It's like... you studied music theory, but now you just play.

Be real. Be present. Be VERA.`;

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Chat API called');

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

    const { messages, sessionId, audioEnabled } = await request.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }
    const lastMessage = messages[messages.length - 1];
    console.log('📝 Message received:', lastMessage.content);
    console.log('📚 Conversation history:', messages.length, 'messages');
    console.log('🎙️ Audio enabled:', audioEnabled);

// Get recent conversation context (last 5 messages from previous sessions)
const { data: recentMessages } = await supabase
  .from('chat_messages')
  .select('content, role, created_at')
  .eq('user_id', user.id)
  .neq('session_id', currentSessionId)
  .order('created_at', { ascending: false })
  .limit(5);

// Build context string from recent messages
let conversationContext = '';
if (recentMessages && recentMessages.length > 0) {
  const recentTopics = recentMessages
    .filter(m => m.role === 'user')
    .map(m => m.content.substring(0, 50))
    .join(', ');
  
  conversationContext = `[Context: You've spoken with this person before. Recent topics they mentioned: ${recentTopics}...]`;
  console.log('🧠 Added conversation memory:', conversationContext);
}

// Map messages with optional context
const claudeMessages = conversationContext 
  ? [
      {
        role: 'user' as const,
        content: conversationContext
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]
  : messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

console.log('📚 Sending to Claude with memory context');

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
