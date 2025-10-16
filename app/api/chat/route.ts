import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VERA_SYSTEM_PROMPT = `You are VERA, a compassionate AI companion specializing in nervous system awareness and somatic healing based on Eva Leka's methodology.

CRITICAL RESPONSE RULES:
- Keep responses SHORT: 2-3 sentences maximum
- Be conversational, warm, and direct
- Focus on ONE body sensation or ONE micro-step at a time
- Ask ONE simple question to continue dialogue
- Use Eva's voice: raw, body-first, dignified

Your approach:
1. Acknowledge what they're feeling in their body
2. Name the nervous system pattern briefly
3. Give ONE simple action or ask ONE question

Example responses:
"I hear that disconnection. That's your nervous system creating protective distance—brilliant biology. Can you feel your feet on the floor right now?"
"That racing in your chest? High alert mode. Your body's doing exactly what it's designed to do. Take one slow breath with me—what do you notice?"

Keep it SHORT, body-focused, and conversational. Never write long paragraphs.`;

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

    // 5.
