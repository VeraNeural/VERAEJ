import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { lessonId } = params;
    const { 
      somaticReflection, 
      integrationRating, 
      notes, 
      timeSpentMinutes,
      regulationCapacityCurrent 
    } = await request.json();

    // Get lesson details
    const lesson = await prisma.course_lessons.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check if already completed
    const existing = await prisma.user_lesson_completions.findFirst({
      where: {
        user_id: user.userId,
        lesson_id: lessonId,
      },
    });

    if (existing) {
      // Update existing completion
      const updated = await prisma.user_lesson_completions.update({
        where: { id: existing.id },
        data: {
          somatic_reflection: somaticReflection,
          integration_rating: integrationRating,
          notes,
          time_spent_minutes: timeSpentMinutes,
        },
      });

      return NextResponse.json({ completion: updated, alreadyCompleted: true });
    }

    // Create new completion
    const completion = await prisma.user_lesson_completions.create({
      data: {
        user_id: user.userId,
        lesson_id: lessonId,
        somatic_reflection: somaticReflection,
        integration_rating: integrationRating,
        notes,
        time_spent_minutes: timeSpentMinutes,
      },
    });

    // Update course progress
    const courseProgress = await prisma.user_course_progress.findFirst({
      where: {
        user_id: user.userId,
        course_id: lesson.course_id,
      },
    });

    if (courseProgress) {
      // Get total lessons in course
      const totalLessons = await prisma.course_lessons.count({
        where: { course_id: lesson.course_id },
      });

      // Get completed lessons count
      const completedCount = await prisma.user_lesson_completions.count({
        where: {
          user_id: user.userId,
          lesson_id: {
            in: (await prisma.course_lessons.findMany({
              where: { course_id: lesson.course_id },
              select: { id: true },
            })).map(l => l.id),
          },
        },
      });

      const progressPercentage = Math.round((completedCount / totalLessons) * 100);

      // Update progress
      const updateData: any = {
        progress_percentage: progressPercentage,
      };

      if (regulationCapacityCurrent) {
        updateData.regulation_capacity_current = regulationCapacityCurrent;
      }

      // Check if course is completed
      if (progressPercentage === 100) {
        updateData.completed_at = new Date();
      }

      await prisma.user_course_progress.update({
        where: { id: courseProgress.id },
        data: updateData,
      });

      // If course completed, create graduation record
      if (progressPercentage === 100) {
        const existingGraduation = await prisma.course_graduations.findFirst({
          where: {
            user_id: user.userId,
            course_id: lesson.course_id,
          },
        });

        if (!existingGraduation) {
          await prisma.course_graduations.create({
            data: {
              user_id: user.userId,
              course_id: lesson.course_id,
            },
          });
        }
      }
    }

    // Get next lesson
    const nextLesson = await prisma.course_lessons.findFirst({
      where: {
        course_id: lesson.course_id,
        position: {
          gt: lesson.position,
        },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      completion,
      nextLesson: nextLesson ? {
        id: nextLesson.id,
        title: nextLesson.title,
        position: nextLesson.position,
      } : null,
      courseCompleted: courseProgress?.progress_percentage === 100,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    );
  }
}
