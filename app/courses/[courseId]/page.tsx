'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen, Users, TrendingUp, CheckCircle, PlayCircle, Lock } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  duration_minutes: number;
  position: number;
  lesson_type: string;
  completed: boolean;
  completed_at: string | null;
  integration_rating: number | null;
}

interface Course {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  thumbnail_url: string | null;
  instructor_name: string;
  tier_required: string;
  duration_weeks: number;
  category: string;
  transformation_focus: string | null;
  prerequisites: string | null;
  total_enrollments: number;
  avg_completion_rate: number;
}

interface CourseProgress {
  started: boolean;
  progress_percentage: number;
  current_lesson_id: string | null;
  last_accessed: string;
  completed: boolean;
  regulation_capacity_start: number | null;
  regulation_capacity_current: number | null;
}

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  max_participants: number;
  current_participants: number;
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [params.courseId]);

  async function loadCourse() {
    try {
      const res = await fetch(`/api/courses/${params.courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons);
        setProgress(data.progress);
        setCohorts(data.cohorts);
        setEnrolled(data.enrolled);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${params.courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId: selectedCohort }),
      });

      if (res.ok) {
        await loadCourse();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  }

  function startLesson(lessonId: string) {
    router.push(`/courses/lessons/${lessonId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Course not found</div>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm mb-2"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {course.category}
                </span>
                {progress?.completed && (
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Completed
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
              {course.tagline && (
                <p className="text-lg text-purple-600 mb-4">{course.tagline}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{course.total_enrollments} students</span>
                </div>
              </div>

              {/* Progress Bar */}
              {enrolled && progress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                    <span className="font-medium">Your Progress</span>
                    <span>{completedLessons} / {totalLessons} lessons</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-slate-700 mb-6 leading-relaxed">{course.description}</p>

              {/* Transformation Focus */}
              {course.transformation_focus && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl mb-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Transformation Focus</h3>
                      <p className="text-sm text-slate-700">{course.transformation_focus}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <h3 className="font-semibold text-slate-900 mb-2">Prerequisites</h3>
                  <p className="text-sm text-slate-700">{course.prerequisites}</p>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const isLocked = enrolled && progress && index > 0 && !lessons[index - 1].completed;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && enrolled && startLesson(lesson.id)}
                      disabled={isLocked || !enrolled}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        lesson.completed
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : enrolled && !isLocked
                          ? 'bg-white border-slate-200 hover:bg-slate-50'
                          : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          lesson.completed
                            ? 'bg-green-500'
                            : enrolled && !isLocked
                            ? 'bg-purple-500'
                            : 'bg-slate-300'
                        }`}>
                          {lesson.completed ? (
                            <CheckCircle size={16} className="text-white" />
                          ) : isLocked || !enrolled ? (
                            <Lock size={16} className="text-white" />
                          ) : (
                            <PlayCircle size={16} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-slate-900">
                              Lesson {lesson.position}: {lesson.title}
                            </h3>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                              {lesson.duration_minutes} min
                            </span>
                          </div>
                          {lesson.subtitle && (
                            <p className="text-sm text-slate-600 mb-1">{lesson.subtitle}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                              {lesson.lesson_type}
                            </span>
                            {lesson.completed && lesson.integration_rating && (
                              <span className="text-xs text-slate-600">
                                Integration: {lesson.integration_rating}/5
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Enrollment Card */}
            {!enrolled ? (
              <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6 mb-6 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Start Your Journey</h3>
                
                {cohorts.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Join a Cohort (Optional)
                    </label>
                    <select
                      value={selectedCohort || ''}
                      onChange={(e) => setSelectedCohort(e.target.value || null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Self-paced</option>
                      {cohorts.map(cohort => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name} - {cohort.current_participants}/{cohort.max_participants} members
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Cohorts provide community support and accountability
                    </p>
                  </div>
                )}

                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6 mb-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Completion</span>
                      <span className="font-medium text-slate-900">{progress?.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${progress?.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {progress?.regulation_capacity_start && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="text-xs text-slate-600 mb-1">Regulation Capacity</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          Start: {progress.regulation_capacity_start}/10
                        </span>
                        {progress.regulation_capacity_current && (
                          <>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm font-medium text-purple-600">
                              Now: {progress.regulation_capacity_current}/10
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const nextLesson = lessons.find(l => !l.completed);
                      if (nextLesson) startLesson(nextLesson.id);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all"
                  >
                    {progress?.completed ? 'Review Course' : 'Continue Learning'}
                  </button>
                </div>
              </div>
            )}

            {/* Instructor Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Your Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium">
                  {course.instructor_name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{course.instructor_name}</div>
                  <div className="text-xs text-slate-500">Course Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
