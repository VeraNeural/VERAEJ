import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// LM Studio runs locally on http://localhost:1234
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get user's conversation history
    const messages = await query(
      `SELECT m.content, m.role 
       FROM messages m
       JOIN chat_sessions c ON m.session_id = c.id
       WHERE c.user_id = $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [userId]
    );

    // Generate protocol using LM Studio
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: `You are a wellness AI analyzing user conversations to generate a personalized wellness protocol.

You must respond with ONLY valid JSON. No markdown, no explanations, no code blocks.

Required JSON structure:
{
  "insights": [
    {"title": "Insight Title", "description": "Detailed description", "confidence": 85}
  ],
  "recommendations": [
    {"category": "Category Name", "actions": ["Action 1", "Action 2"]}
  ]
}

Example:
{
  "insights": [
    {"title": "Sleep Pattern Issues", "description": "User frequently mentions difficulty sleeping and fatigue", "confidence": 90}
  ],
  "recommendations": [
    {"category": "Sleep Hygiene", "actions": ["Establish consistent bedtime", "Reduce screen time before bed", "Create calming bedtime routine"]}
  ]
}`
          },
          {
            role: 'user',
            content: `Analyze these conversations and generate a wellness protocol. Return ONLY the JSON structure, nothing else:

Conversations:
${JSON.stringify(messages.rows.slice(0, 20), null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio error: ${response.statusText}`);
    }

    const data = await response.json();
    const protocolText = data.choices[0].message.content;

    // Clean up response (remove markdown if model adds it)
    const cleanedText = protocolText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let protocolData;
    try {
      protocolData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse protocol JSON:', cleanedText);
      // Fallback protocol if parsing fails
      protocolData = {
        insights: [
          {
            title: "Analysis in Progress",
            description: "Unable to generate detailed analysis at this time. Please try again or continue your wellness journey.",
            confidence: 50
          }
        ],
        recommendations: [
          {
            category: "General Wellness",
            actions: [
              "Continue regular check-ins with VERA",
              "Track your daily mood and energy levels",
              "Focus on consistent sleep schedule"
            ]
          }
        ]
      };
    }

    // Save to database
    const result = await query(
      `INSERT INTO protocols (user_id, generated, insights, recommendations)
       VALUES ($1, NOW(), $2, $3)
       RETURNING *`,
      [userId, JSON.stringify(protocolData.insights), JSON.stringify(protocolData.recommendations)]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to generate protocol:', error);
    return NextResponse.json({ 
      error: 'Failed to generate protocol',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}