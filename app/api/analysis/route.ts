import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { conversationHistory, userId } = await req.json();

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: 'No conversation history provided' },
        { status: 400 }
      );
    }

    // Step 1: GPT-4 analyzes the conversation for patterns
    console.log('Sending conversation to GPT-4 for analysis...');
    
    const analysisPrompt = `You are a trauma-informed psychologist and somatic therapist analyzing a conversation between a user and VERA (an AI therapist).

Analyze this conversation and identify:
1. **Nervous System Patterns**: What nervous system states appear (fight, flight, freeze, fawn)?
2. **Emotional Themes**: What recurring emotions or feelings are present?
3. **Triggers**: What specific situations, memories, or topics activate the nervous system?
4. **Somatic Responses**: What body sensations or physical reactions are mentioned?
5. **Attachment Patterns**: Are there signs of anxious, avoidant, or disorganized attachment?
6. **Progress Indicators**: What signs of growth, regulation, or insight appear?
7. **Recommendations**: What therapeutic approaches or protocols would be most helpful?

Conversation:
${JSON.stringify(conversationHistory, null, 2)}

Provide your analysis as a JSON object with these exact keys:
{
  "nervous_system_states": ["state1", "state2"],
  "emotional_themes": ["theme1", "theme2"],
  "identified_triggers": ["trigger1", "trigger2"],
  "somatic_responses": ["response1", "response2"],
  "attachment_patterns": "brief description",
  "progress_indicators": ["indicator1", "indicator2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "2-3 sentence overview"
}`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a trauma-informed psychologist. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      response_format: { type: 'json_object' },
    });

    const rawAnalysis = gptResponse.choices[0].message.content;
    let structuredAnalysis;

    try {
      structuredAnalysis = JSON.parse(rawAnalysis || '{}');
    } catch (error) {
      console.error('Failed to parse GPT-4 response:', error);
      return NextResponse.json(
        { error: 'Failed to parse analysis' },
        { status: 500 }
      );
    }

    console.log('GPT-4 analysis complete. Sending to Claude for empathetic presentation...');

    // Step 2: Claude presents the insights empathetically
    const claudePrompt = `A deep analysis has been completed on the user's conversation patterns. Your role is to present these insights in an empathetic, validating, and hope-filled way.

Analysis Data:
${JSON.stringify(structuredAnalysis, null, 2)}

Guidelines:
- Use "I notice" language, not "You have" or "You are"
- Validate their experience
- Highlight progress and strengths
- Present patterns gently without pathologizing
- End with hope and next steps
- Keep it conversational and warm
- Use their own words/themes when possible

Create an empathetic summary that helps them understand their patterns while feeling seen and supported.`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: claudePrompt,
        },
      ],
    });

    const empathetic_summary = claudeResponse.content[0].text;

    // Step 3: Return both structured data and empathetic summary
    return NextResponse.json({
      success: true,
      analysis: {
        raw: structuredAnalysis,
        empathetic_summary: empathetic_summary,
        analyzed_at: new Date().toISOString(),
        conversation_length: conversationHistory.length,
      },
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate analysis',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
