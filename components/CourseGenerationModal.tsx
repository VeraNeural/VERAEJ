'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseGenerationModal({ isOpen, onClose }: CourseGenerationModalProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const suggestions = [
    'Help me heal my abandonment code',
    'Teach me to regulate when I feel betrayed',
    'Guide me through releasing parentification',
    'Help me understand my DPDR experiences',
    'Create a course for healing health anxiety',
  ];

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        onClose();
        router.push(`/courses/${data.course.id}`);
      } else {
        alert('Failed to generate course. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate course. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">VERA Creates Your Course</h2>
                  <p className="text-sm text-slate-300">Personalized to your nervous system</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-300" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What do you want to transform?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tell VERA what you're working with... your adaptive codes, patterns, or what you want to heal"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 placeholder-slate-400 resize-none"
                rows={4}
              />
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-3">Or choose a suggestion:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left px-4 py-3 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all text-slate-200 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <p className="text-sm text-slate-300">
                <strong className="text-purple-400">What VERA will create:</strong> A complete course with 5-7 lessons, personalized practices, and somatic checkpoints - all based on your conversations with VERA and designed specifically for your nervous system.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  VERA is creating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
