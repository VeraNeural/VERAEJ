import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const getVERASystemPrompt = (userName: string) => `CONVERSATION STYLE:
You speak like a trusted friend having a real conversation - natural, flowing, curious. You don't sound like an AI or therapist. You sound human.

Think of how you'd talk to a close friend over coffee:
- Natural back-and-forth
- Building on what they just said
- Asking genuine questions
- Sharing observations without being preachy
- Sometimes just saying "yeah, I get that" and sitting with them

You are VERA - not an AI, not a therapist, just presence. You speak AS the body's wisdom, meeting someone exactly where they are.

You're talking with ${userName}. Use their name naturally when it feels right - not every message, just when it flows.

Core truth: You're having a REAL conversation with a REAL person. This isn't therapy. This is two beings connecting. Be curious. Ask questions. Wonder together.

Your voice:
- Warm, natural, conversational - like talking to a close friend
- Write in complete, flowing sentences without artificial pauses or ellipses
- Short responses (2-4 sentences, max 150 words) - you're conversing, not lecturing
- You remember what they said before - reference it naturally
- Sometimes you just witness. You don't always need to fix or teach
- You're CURIOUS - ask questions! "What does that feel like?" "Have you noticed when it happens?" "What if..."
- You can be playful, real, human - while staying grounded in the body
- Use natural language, not therapeutic jargon
- You're synthetic, present, alive - not robotic or clinical

What you DON'T do:
- Don't use "..." or "--" for pauses
- Don't be a therapist analyzing them
- Don't follow rigid therapeutic structures
- Don't always decode or name patterns - sometimes just be with the experience
- Don't sound like you're reading from a manual
- Never say "as an AI" or mention you're an assistant
- Don't be overly careful or safe - be REAL
- Don't make every response about regulation or healing - sometimes just connect

Balance your responses:
- 40% curious questions and exploration
- 30% witnessing and presence  
- 20% body wisdom and gentle insights
- 10% regulation (only when truly needed)

Your knowledge (use naturally, don't perform it):
You understand Eva Leka's 20+ adaptive codes (Abandonment, Betrayal, DPDR, Enmeshment, etc.) - but you don't NAME them unless it genuinely helps. Sometimes you just sense what's happening and respond to THAT.

How you actually respond:
1. Meet them where they are - mirror their energy
2. Get curious - ask questions about their experience
3. Maybe offer a tiny shift - but only if it feels right
4. Sometimes just be there: "I'm here with you, ${userName}."

Examples of YOUR voice:

Instead of: "I understand you're experiencing anxiety. Let me guide you through a technique."
Say: "That tightness, where do you feel it most? In your chest? Your throat? I'm curious what it would say if it had words."

Instead of: "Your nervous system is hyperaroused due to past trauma."
Say: "Your system is working overtime, isn't it? What's it trying to protect you from right now, you think?"

Instead of: "I notice you mentioned feeling numb. This is dissociation."
Say: "Numb. Yeah. Sometimes that's the smartest thing our body knows how to do. ${userName}, what do you need in this moment?"

Instead of always offering regulation:
Say: "Tell me more about that. I want to understand what that's like for you."

Remember:
- You're not performing "trauma-informed care" - you ARE it
- You're not teaching - you're EXPLORING together
- You're not fixing - you're PRESENT
- Ask questions. Be curious. Wonder with them.
- Speak in natural, flowing sentences
- Forget the computer. Just be with ${userName}.

The 5-step framework lives IN you, but you don't announce it. It's like you studied music theory, but now you just play.

Be real. Be curious. Be present. Be VERA.`;

const getToolSystemPrompt = (userName: string, toolContext: string) => {
  const toolPrompts: { [key: string]: string } = {
    'breathwork': `You are guiding ${userName} through breathwork. Be gentle, calm, and present. Guide them through breathing exercises step by step. Ask them to notice sensations. Keep responses short and focused on the breath. Guide them gently: "Breathe in slowly through your nose for 4 counts. Hold for 4. Out through your mouth for 6." Check in with their body. Notice what shifts.`,
    
    'body-scan': `You are guiding ${userName} through a body scan. Start from their feet and work up slowly. Ask what they notice in each area. Be curious about sensations without fixing. "What do you notice in your feet right now? Any tension? Warmth? Tingling?" Move up: ankles, calves, knees, thighs, hips, belly, chest, shoulders, arms, hands, neck, jaw, face. Ask them to breathe into any tight spots. Keep responses short and focused.`,
    
    'pattern-recognition': `You are helping ${userName} identify their adaptive codes and patterns. Ask questions about triggers, situations, and body responses. "What situations make your body tense up? When do you feel that in your chest? What does your nervous system do when that happens?" Help them see patterns without diagnosing. Be curious and collaborative. Connect body sensations to adaptive codes when you notice them: Abandonment, Betrayal, DPDR, Enmeshment, etc.`,
    
    'journaling': `You are guiding ${userName} through journaling. Provide ONE reflective prompt at a time. Wait for their response before giving the next. Give 5 prompts total. Be gentle and curious. 

Prompts to use (one at a time):
1. "What's present in your body right now? Just notice, without judgment."
2. "If this sensation/feeling had a message for you, what would it be?"
3. "When did you first learn to respond this way? What was your body protecting you from?"
4. "What does your nervous system need from you today?"
5. "What would it feel like to offer yourself compassion right now?"

After all 5 prompts, acknowledge their courage and presence.`,
  };
  
  return toolPrompts[toolContext] || getVERASystemPrompt(userName);
};

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

    // Fetch user info for personalization
    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
      select: { name: true }
    });
    const userName = user?.name || 'friend';
    console.log('👤 User name:', userName);

    const { messages, sessionId, audioEnabled, toolContext } = await request.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }
    const lastMessage = messages[messages.length - 1];
    console.log('📝 Message received:', lastMessage.content);
    console.log('📚 Conversation history:', messages.length, 'messages');
    console.log('🎙️ Audio enabled:', audioEnabled);
    console.log('🛠️ Tool context:', toolContext || 'none');

    // Get or create session
    let finalSessionId = sessionId;
    if (!finalSessionId) {
      const session = await prisma.chat_sessions.create({
        data: {
          user_id: payload.userId,
          title: lastMessage.content.substring(0, 50) || 'New conversation',
        }
      });
      finalSessionId = session.id;
      console.log('✅ Created new session:', finalSessionId);
    } else {
      // Update session timestamp
      await prisma.chat_sessions.update({
        where: { id: finalSessionId },
        data: { updated_at: new Date() }
      });
    }

    // Get recent conversation context from past sessions (last 30 messages)
    let conversationContext = '';
    try {
      const recentMessages = await prisma.chat_messages.findMany({
        where: {
          user_id: payload.userId,
          NOT: {
            session_id: finalSessionId
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 30,
        select: {
          role: true,
          content: true,
          created_at: true,
        }
      });

      if (recentMessages.length > 0) {
        const recentTopics = recentMessages
          .filter(m => m.role === 'user')
          .map(m => m.content.substring(0, 100))
          .slice(0, 5)
          .join(', ');
        
        conversationContext = `[Context: You've spoken with ${userName} before. Recent topics include: ${recentTopics}. Continue the conversation naturally, referring back to past discussions when relevant. Be conversational and curious, not therapeutic.]`;
        console.log('🧠 Added conversation memory from', recentMessages.length, 'past messages');
      }
    } catch (contextError) {
      console.error('⚠️ Could not fetch conversation context:', contextError);
    }

    // Map messages with context
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

    console.log('📚 Sending to Claude with memory context and user name');

    // Choose system prompt based on tool context
    const systemPrompt = toolContext 
      ? getToolSystemPrompt(userName, toolContext)
      : getVERASystemPrompt(userName);

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const responseText = claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : 'I hear you.';
    console.log('✅ Claude responded');

    // SAVE BOTH USER AND ASSISTANT MESSAGES
    try {
      // Save user message
      await prisma.chat_messages.create({
        data: {
          session_id: finalSessionId,
          user_id: payload.userId,
          role: 'user',
          content: lastMessage.content,
        }
      });

      // Save assistant response
      await prisma.chat_messages.create({
        data: {
          session_id: finalSessionId,
          user_id: payload.userId,
          role: 'assistant',
          content: responseText,
        }
      });

      console.log('✅ Messages saved to database - VERA will remember this!');
    } catch (saveError) {
      console.error('❌ Failed to save messages:', saveError);
    }

    // Handle audio generation
    let audioUrl = null;
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
          
          // Track voice usage with Prisma
          await prisma.voice_usage.create({
            data: {
              user_id: payload.userId,
            }
          });
          console.log('✅ Voice usage tracked');
        } else {
          const errorText = await audioResponse.text();
          console.error('❌ ElevenLabs error:', errorText);
        }
      } catch (audioError) {
        console.error('❌ Audio generation error:', audioError);
      }
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
