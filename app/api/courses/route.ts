import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all published courses
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const courses = await prisma.courses.findMany({
      where: {
        is_published: true,
      },
      orderBy: [
        { position: 'asc' },
        { created_at: 'desc' },
      ],
      include: {
        _count: {
          select: {
            course_lessons: true,
          },
        },
      },
    });

    // Get user's progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await prisma.user_course_progress.findFirst({
          where: {
            user_id: user.userId,
            course_id: course.id,
          },
        });

        return {
          id: course.id,
          title: course.title,
          tagline: course.tagline,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          instructor_name: course.instructor_name,
          tier_required: course.tier_required,
          duration_weeks: course.duration_weeks,
          lesson_count: course._count.course_lessons,
          category: course.category,
          transformation_focus: course.transformation_focus,
          total_enrollments: course.total_enrollments,
          avg_completion_rate: course.avg_completion_rate,
          user_progress: progress ? {
            started: true,
            progress_percentage: progress.progress_percentage,
            last_accessed: progress.last_accessed,
            completed: !!progress.completed_at,
          } : null,
        };
      })
    );

    return NextResponse.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new AI-generated course
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { title, description, category, tierRequired, durationWeeks, transformationFocus } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description required' },
        { status: 400 }
      );
    }

    const course = await prisma.courses.create({
      data: {
        title,
        description,
        category: category || 'general',
        tier_required: tierRequired || 'explorer',
        duration_weeks: durationWeeks || 4,
        transformation_focus: transformationFocus,
        instructor_name: 'VERA AI',
        is_published: false, // Draft until lessons are generated
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
