'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Users, TrendingUp, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  thumbnail_url: string | null;
  instructor_name: string;
  tier_required: string;
  duration_weeks: number;
  lesson_count: number;
  category: string;
  transformation_focus: string;
  total_enrollments: number;
  avg_completion_rate: number;
  user_progress: {
    started: boolean;
    progress_percentage: number;
    last_accessed: string;
    completed: boolean;
  } | null;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('free');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCourses();
    loadUserTier();
  }, []);

  async function loadUserTier() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserTier(data.user.subscription_tier || 'free');
      }
    } catch (error) {
      console.error('Failed to load user tier:', error);
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }

  function canAccessCourse(tierRequired: string): boolean {
    const tierLevels: Record<string, number> = {
      free: 0,
      explorer: 1,
      regulator: 2,
      integrator: 3,
      test: 4,
    };
    return tierLevels[userTier] >= tierLevels[tierRequired];
  }

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => router.push('/chat')}
                className="text-purple-600 hover:text-purple-700 text-sm mb-2"
              >
                Back to Chat
              </button>
              <h1 className="text-3xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                VERA Courses
              </h1>
              <p className="text-slate-600 mt-1">Nervous system transformation, not just information</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const hasAccess = canAccessCourse(course.tier_required);
              const inProgress = course.user_progress?.started && !course.user_progress?.completed;
              const completed = course.user_progress?.completed;

              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-3xl shadow-lg border overflow-hidden transition-all hover:shadow-xl ${
                    !hasAccess ? 'opacity-75' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={64} className="text-white opacity-50" />
                      </div>
                    )}
                    {!hasAccess && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock size={32} className="text-white" />
                      </div>
                    )}
                    {completed && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={14} />
                        Completed
                      </div>
                    )}
                    {inProgress && !completed && (
                      <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <PlayCircle size={14} />
                        In Progress
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {course.category}
                      </span>
                      {!hasAccess && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <Lock size={10} />
                          {course.tier_required}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{course.title}</h3>
                    {course.tagline && (
                      <p className="text-sm text-purple-600 mb-2">{course.tagline}</p>
                    )}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>

                    {/* Transformation Focus */}
                    {course.transformation_focus && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                        <div className="flex items-start gap-2">
                          <TrendingUp size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-700">{course.transformation_focus}</p>
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.duration_weeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{course.lesson_count} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{course.total_enrollments}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {inProgress && course.user_progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Your Progress</span>
                          <span>{course.user_progress.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${course.user_progress.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {hasAccess ? (
                      <Link
                        href={`/courses/${course.id}`}
                        className="block w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium text-center transition-all"
                      >
                        {completed ? 'Review Course' : inProgress ? 'Continue' : 'Start Course'}
                      </Link>
                    ) : (
                      <button
                        onClick={() => router.push('/pricing')}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                      >
                        Upgrade to Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
