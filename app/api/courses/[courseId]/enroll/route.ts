import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId } = params;
    const { cohortId } = await request.json();

    // Check if course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.user_course_progress.findFirst({
      where: {
        user_id: user.userId,
        course_id: courseId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Get first lesson
    const firstLesson = await prisma.course_lessons.findFirst({
      where: { course_id: courseId },
      orderBy: { position: 'asc' },
    });

    // Create enrollment
    const enrollment = await prisma.user_course_progress.create({
      data: {
        user_id: user.userId,
        course_id: courseId,
        cohort_id: cohortId || null,
        current_lesson_id: firstLesson?.id || null,
        regulation_capacity_start: 5, // Default, can be updated
      },
    });

    // If joining a cohort, add to cohort members
    if (cohortId) {
      await prisma.cohort_members.create({
        data: {
          cohort_id: cohortId,
          user_id: user.userId,
        },
      });

      // Update cohort participant count
      await prisma.course_cohorts.update({
        where: { id: cohortId },
        data: {
          current_participants: {
            increment: 1,
          },
        },
      });
    }

    // Update course enrollment count
    await prisma.courses.update({
      where: { id: courseId },
      data: {
        total_enrollments: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    );
  }
}
