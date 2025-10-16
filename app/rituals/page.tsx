'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ritual {
  id: string;
  date: string;
  nervous_system_state: string;
  ritual_text: string;
  ritual_type: string;
  completed: boolean;
  completed_at: string | null;
  reflection: string | null;
}

export default function RitualsPage() {
  const router = useRouter();
  const [todayRitual, setTodayRitual] = useState<Ritual | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    checkTodayStatus();
    loadStreak();
  }, []);

  async function checkTodayStatus() {
    try {
      const res = await fetch('/api/rituals/today');
      if (res.ok) {
        const data = await res.json();
        if (data.ritual) {
          setTodayRitual(data.ritual);
          setHasCheckedIn(true);
          setReflection(data.ritual.reflection || '');
        } else {
          setHasCheckedIn(false);
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  }

  async function loadStreak() {
    try {
      const res = await fetch('/api/rituals/streak');
      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
      }
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  }

  async function handleCheckIn(state: string) {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/rituals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayRitual(data.ritual);
        setHasCheckedIn(true);
      }
    } catch (error) {
      console.error('Failed to generate ritual:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleComplete() {
    if (!todayRitual) return;

    try {
      const res = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ritualId: todayRitual.id,
          reflection: reflection.trim() || null
        }),
      });

      if (res.ok) {
        checkTodayStatus();
        loadStreak();
      }
    } catch (error) {
      console.error('Failed to complete ritual:', error);
    }
  }

  const getStateEmoji = (state: string) => {
    const emojis: { [key: string]: string } = {
      'activated': '🔥',
      'settled': '🌊',
      'shutdown': '💤'
    };
    return emojis[state] || '🌊';
  };

  const getStateLabel = (state: string) => {
    const labels: { [key: string]: string } = {
      'activated': 'Activated',
      'settled': 'Settled',
      'shutdown': 'Shutdown'
    };
    return labels[state] || state;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600">Generating your ritual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
            Daily Ritual
          </h1>
          <button
            onClick={() => router.push('/chat')}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Streak */}
        {streak > 0 && (
          <div className="text-center mb-8">
            <p className="text-4xl mb-2">🔥</p>
            <p className="text-slate-600">
              <span className="text-2xl font-medium text-slate-900">{streak}</span> day streak
            </p>
          </div>
        )}

        {!hasCheckedIn ? (
          /* Check-in Flow */
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <h2 className="text-3xl font-light text-slate-900 mb-4">
              Good morning
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              How's your nervous system today?
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => handleCheckIn('activated')}
                className="p-8 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-2xl border-2 border-red-200 transition-all"
              >
                <p className="text-5xl mb-3">🔥</p>
                <p className="text-lg font-medium text-slate-900">Activated</p>
                <p className="text-sm text-slate-600 mt-1">Anxious, wired, overwhelmed</p>
              </button>

              <button
                onClick={() => handleCheckIn('settled')}
                className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-2xl border-2 border-blue-200 transition-all"
              >
                <p className="text-5xl mb-3">🌊</p>
                <p className="text-lg font-medium text-slate-900">Settled</p>
                <p className="text-sm text-slate-600 mt-1">Calm, present, regulated</p>
              </button>

              <button
                onClick={() => handleCheckIn('shutdown')}
                className="p-8 bg-gradient-to-br from-slate-50 to-purple-50 hover:from-slate-100 hover:to-purple-100 rounded-2xl border-2 border-slate-200 transition-all"
              >
                <p className="text-5xl mb-3">💤</p>
                <p className="text-lg font-medium text-slate-900">Shutdown</p>
                <p className="text-sm text-slate-600 mt-1">Numb, disconnected, collapsed</p>
              </button>
            </div>
          </div>
        ) : todayRitual ? (
          /* Today's Ritual */
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getStateEmoji(todayRitual.nervous_system_state)}</span>
                  <div>
                    <p className="text-sm text-slate-500">Your state today</p>
                    <p className="text-lg font-medium text-slate-900">
                      {getStateLabel(todayRitual.nervous_system_state)}
                    </p>
                  </div>
                </div>
                {todayRitual.completed && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Completed
                  </span>
                )}
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {todayRitual.ritual_text}
                </p>
              </div>

              {!todayRitual.completed ? (
                <div className="space-y-4">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="How did this land for you? (optional)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleComplete}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg"
                  >
                    Mark as Complete
                  </button>
                </div>
              ) : todayRitual.reflection && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="text-sm text-slate-500 mb-2">Your reflection:</p>
                  <p className="text-slate-700">{todayRitual.reflection}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
