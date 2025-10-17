'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, MessageSquare, Send } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string;
  video_url: string | null;
  audio_url: string | null;
  duration_minutes: number;
  position: number;
  lesson_type: string;
  somatic_checkpoint: string | null;
  unlocked_practices: any;
  course: {
    id: string;
    title: string;
    tier_required: string;
  };
}

interface Completion {
  completed: boolean;
  completed_at: string;
  somatic_reflection: string | null;
  integration_rating: number | null;
  notes: string | null;
  time_spent_minutes: number | null;
}

interface Discussion {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  is_insight: boolean;
  created_at: string;
}

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [somaticReflection, setSomaticReflection] = useState('');
  const [integrationRating, setIntegrationRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [regulationCapacity, setRegulationCapacity] = useState(5);
  const [completing, setCompleting] = useState(false);

  // Discussion state
  const [newDiscussion, setNewDiscussion] = useState('');
  const [postingDiscussion, setPostingDiscussion] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [params.lessonId]);

  async function loadLesson() {
    try {
      const res = await fetch(`/api/courses/lessons/${params.lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data.lesson);
        setCompletion(data.completion);
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);

    try {
      const res = await fetch(`/api/courses/lessons/${params.lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          somaticReflection,
          integrationRating,
          notes,
          timeSpentMinutes,
          regulationCapacityCurrent: regulationCapacity,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompletion(data.completion);
        setShowCompletionModal(false);

        if (data.nextLesson) {
          router.push(`/courses/lessons/${data.nextLesson.id}`);
        } else if (data.courseCompleted) {
          alert('Congratulations! You completed the course!');
          router.push(`/courses/${lesson?.course.id}`);
        } else {
          router.push(`/courses/${lesson?.course.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      alert('Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  }

  async function postDiscussion() {
    if (!newDiscussion.trim()) return;

    setPostingDiscussion(true);
    try {
      const res = await fetch('/api/courses/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: params.lessonId,
          content: newDiscussion.trim(),
        }),
      });

      if (res.ok) {
        setNewDiscussion('');
        loadLesson();
      }
    } catch (error) {
      console.error('Failed to post discussion:', error);
    } finally {
      setPostingDiscussion(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Lesson not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/courses/${lesson.course.id}`)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm mb-2"
          >
            <ArrowLeft size={16} />
            Back to {lesson.course.title}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Lesson {lesson.position}: {lesson.title}
              </h1>
              {lesson.subtitle && (
                <p className="text-sm text-slate-600">{lesson.subtitle}</p>
              )}
            </div>
            {completion?.completed && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8 mb-6">
          {/* Video/Audio */}
          {lesson.video_url && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <video
                controls
                className="w-full"
                src={lesson.video_url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {lesson.audio_url && !lesson.video_url && (
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl">
              <audio controls className="w-full">
                <source src={lesson.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Lesson Content */}
          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>

          {/* Somatic Checkpoint */}
          {lesson.somatic_checkpoint && (
            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl mb-6">
              <h3 className="font-bold text-slate-900 mb-3">Somatic Checkpoint</h3>
              <p className="text-slate-700 mb-4">{lesson.somatic_checkpoint}</p>
              <p className="text-sm text-slate-600 italic">
                Take a moment to pause and notice what's happening in your body right now.
              </p>
            </div>
          )}

          {/* Complete Lesson Button */}
          {!completion?.completed && (
            <button
              onClick={() => setShowCompletionModal(true)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all"
            >
              Complete This Lesson
            </button>
          )}
        </div>

        {/* Discussions */}
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={24} />
            Discussion
          </h2>

          {/* New Discussion Form */}
          <div className="mb-6">
            <textarea
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              placeholder="Share your insights, questions, or reflections..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={postDiscussion}
                disabled={!newDiscussion.trim() || postingDiscussion}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {discussions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No discussions yet. Be the first to share your thoughts!
              </p>
            ) : (
              discussions.map(discussion => (
                <div key={discussion.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {discussion.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{discussion.user_name}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                        {discussion.is_insight && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            Insight
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{discussion.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowCompletionModal(false)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Complete Lesson</h2>
                <p className="text-sm text-slate-600 mt-1">Reflect on your experience</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Somatic Reflection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What's happening in your body right now?
                  </label>
                  <textarea
                    value={somaticReflection}
                    onChange={(e) => setSomaticReflection(e.target.value)}
                    placeholder="Describe any sensations, emotions, or shifts you notice..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Integration Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    How integrated does this feel? (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setIntegrationRating(rating)}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          integrationRating === rating
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regulation Capacity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current regulation capacity (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={regulationCapacity}
                    onChange={(e) => setRegulationCapacity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1</span>
                    <span className="font-medium text-purple-600">{regulationCapacity}</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personal notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any insights, questions, or reminders for yourself..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {completing ? 'Completing...' : 'Complete Lesson'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
