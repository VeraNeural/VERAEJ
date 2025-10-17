import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId } = params;

    // Get course details
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        course_lessons: {
          where: { is_published: true },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            subtitle: true,
            description: true,
            duration_minutes: true,
            position: true,
            lesson_type: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get user's progress
    const progress = await prisma.user_course_progress.findFirst({
      where: {
        user_id: user.userId,
        course_id: courseId,
      },
    });

    // Get completed lessons
    const completedLessons = await prisma.user_lesson_completions.findMany({
      where: {
        user_id: user.userId,
        lesson_id: {
          in: course.course_lessons.map(l => l.id),
        },
      },
      select: {
        lesson_id: true,
        completed_at: true,
        integration_rating: true,
      },
    });

    // Get active cohorts for this course
    const cohorts = await prisma.course_cohorts.findMany({
      where: {
        course_id: courseId,
        is_active: true,
        start_date: {
          gte: new Date(),
        },
      },
      orderBy: { start_date: 'asc' },
    });

    // Map lessons with completion status
    const lessonsWithProgress = course.course_lessons.map(lesson => {
      const completion = completedLessons.find(c => c.lesson_id === lesson.id);
      return {
        ...lesson,
        completed: !!completion,
        completed_at: completion?.completed_at,
        integration_rating: completion?.integration_rating,
      };
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        tagline: course.tagline,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        instructor_name: course.instructor_name,
        tier_required: course.tier_required,
        duration_weeks: course.duration_weeks,
        category: course.category,
        transformation_focus: course.transformation_focus,
        prerequisites: course.prerequisites,
        total_enrollments: course.total_enrollments,
        avg_completion_rate: course.avg_completion_rate,
      },
      lessons: lessonsWithProgress,
      progress: progress ? {
        started: true,
        progress_percentage: progress.progress_percentage,
        current_lesson_id: progress.current_lesson_id,
        last_accessed: progress.last_accessed,
        completed: !!progress.completed_at,
        regulation_capacity_start: progress.regulation_capacity_start,
        regulation_capacity_current: progress.regulation_capacity_current,
      } : null,
      cohorts,
      enrolled: !!progress,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
