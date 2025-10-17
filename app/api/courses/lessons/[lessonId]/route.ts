import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { lessonId } = params;

    // Get lesson details
    const lesson = await prisma.course_lessons.findUnique({
      where: { id: lessonId },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            tier_required: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if user is enrolled in the course
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

    // Get completion status
    const completion = await prisma.user_lesson_completions.findFirst({
      where: {
        user_id: user.userId,
        lesson_id: lessonId,
      },
    });

    // Get discussions for this lesson
    const discussions = await prisma.course_discussions.findMany({
      where: { lesson_id: lessonId },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update last accessed time
    await prisma.user_course_progress.update({
      where: { id: enrollment.id },
      data: {
        last_accessed: new Date(),
        current_lesson_id: lessonId,
      },
    });

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        subtitle: lesson.subtitle,
        description: lesson.description,
        content: lesson.content,
        video_url: lesson.video_url,
        audio_url: lesson.audio_url,
        duration_minutes: lesson.duration_minutes,
        position: lesson.position,
        lesson_type: lesson.lesson_type,
        somatic_checkpoint: lesson.somatic_checkpoint,
        unlocked_practices: lesson.unlocked_practices,
        course: lesson.courses,
      },
      completion: completion ? {
        completed: true,
        completed_at: completion.completed_at,
        somatic_reflection: completion.somatic_reflection,
        integration_rating: completion.integration_rating,
        notes: completion.notes,
        time_spent_minutes: completion.time_spent_minutes,
      } : null,
      discussions: discussions.map(d => ({
        id: d.id,
        content: d.content,
        user_name: d.users.name,
        user_id: d.user_id,
        is_insight: d.is_insight,
        created_at: d.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
