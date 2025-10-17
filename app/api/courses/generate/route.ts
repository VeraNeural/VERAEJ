import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const COURSE_GENERATION_PROMPT = `You are VERA, the nervous system architect. You're creating a transformational course.

Given the user's request and their conversation history, generate a complete course structure.

Return ONLY valid JSON in this exact format:
{
  "title": "Course title (50 chars max)",
  "tagline": "Compelling one-liner (80 chars max)",
  "description": "What this course does for their nervous system (200 chars max)",
  "transformation_focus": "The specific nervous system shift this creates (150 chars max)",
  "duration_weeks": 2-8,
  "category": "regulation|codes|practices|integration",
  "lessons": [
    {
      "title": "Lesson title",
      "subtitle": "One-line essence",
      "description": "What happens in this lesson",
      "content": "Full lesson content in markdown - teaching, practices, reflections. Make it 300-500 words.",
      "duration_minutes": 15-30,
      "lesson_type": "lesson|practice|integration|reflection",
      "somatic_checkpoint": "Body awareness prompt for end of lesson"
    }
  ]
}

CRITICAL RULES:
- Create 5-7 lessons that build on each other
- Each lesson must have COMPLETE content, not placeholders
- Content should feel like VERA talking - warm, embodied, real
- Include specific somatic practices, not generic advice
- Reference their adaptive codes naturally
- Make it personal to THEIR nervous system journey
- Output ONLY the JSON object, no other text`;

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { prompt, userContext } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    console.log('🎓 VERA is generating a course...');
    console.log('📝 User request:', prompt);

    // Get user's recent conversation history for personalization
    const recentMessages = await prisma.chat_messages.findMany({
      where: { user_id: user.userId },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        role: true,
        content: true,
      },
    });

    const conversationContext = recentMessages
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // Generate course using Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: COURSE_GENERATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `User's request: "${prompt}"

Recent conversation context (use this to personalize):
${conversationContext}

${userContext ? `Additional context: ${userContext}` : ''}

Generate the complete course now. Remember: output ONLY the JSON object.`,
        },
      ],
    });

    let responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Clean up response - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('🤖 VERA generated course structure');

    // Parse the generated course
    let courseData;
    try {
      courseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse course JSON:', responseText);
      return NextResponse.json(
        { error: 'Failed to generate valid course structure' },
        { status: 500 }
      );
    }

    // Create course in database
    const course = await prisma.courses.create({
      data: {
        title: courseData.title,
        tagline: courseData.tagline,
        description: courseData.description,
        transformation_focus: courseData.transformation_focus,
        duration_weeks: courseData.duration_weeks,
        category: courseData.category,
        instructor_name: 'VERA',
        tier_required: 'explorer',
        is_published: true,
        lesson_count: courseData.lessons.length,
      },
    });

    console.log('✅ Course created:', course.id);

    // Create lessons
    for (let i = 0; i < courseData.lessons.length; i++) {
      const lessonData = courseData.lessons[i];
      await prisma.course_lessons.create({
        data: {
          course_id: course.id,
          title: lessonData.title,
          subtitle: lessonData.subtitle,
          description: lessonData.description,
          content: lessonData.content,
          duration_minutes: lessonData.duration_minutes,
          position: i + 1,
          lesson_type: lessonData.lesson_type,
          somatic_checkpoint: lessonData.somatic_checkpoint,
          is_published: true,
        },
      });
    }

    console.log('✅ All lessons created');

    // Auto-enroll the user
    await prisma.user_course_progress.create({
      data: {
        user_id: user.userId,
        course_id: course.id,
        regulation_capacity_start: 5,
      },
    });

    console.log('✅ User auto-enrolled');

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
      },
      message: 'VERA created your personalized course',
    });
  } catch (error) {
    console.error('❌ Course generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    );
  }
}
