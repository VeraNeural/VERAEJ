import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { lessonId, content, isInsight } = await request.json();

    if (!lessonId || !content) {
      return NextResponse.json(
        { error: 'Lesson ID and content required' },
        { status: 400 }
      );
    }

    // Verify user is enrolled in the course
    const lesson = await prisma.course_lessons.findUnique({
      where: { id: lessonId },
      select: { course_id: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const enrollment = await prisma.user_course_progress.findFirst({
      where: {
        user_id: user.userId,
        course_id: lesson.course_id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Create discussion
    const discussion = await prisma.course_discussions.create({
      data: {
        lesson_id: lessonId,
        user_id: user.userId,
        content: content.trim(),
        is_insight: isInsight || false,
      },
    });

    return NextResponse.json({ discussion });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
