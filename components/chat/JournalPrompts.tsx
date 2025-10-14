import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Heart, Brain, Zap, Moon } from 'lucide-react';

interface JournalPromptsProps {
  darkMode: boolean;
  userId: string;
}

interface Prompt {
  id: string;
  category: 'emotional' | 'mental' | 'physical' | 'spiritual';
  prompt: string;
  icon: any;
}

const JournalPrompts: React.FC<JournalPromptsProps> = ({ darkMode, userId }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryIcons = {
    emotional: Heart,
    mental: Brain,
    physical: Zap,
    spiritual: Moon,
  };

  const categoryColors = {
    emotional: darkMode ? 'text-rose-400' : 'text-rose-600',
    mental: darkMode ? 'text-blue-400' : 'text-blue-600',
    physical: darkMode ? 'text-green-400' : 'text-green-600',
    spiritual: darkMode ? 'text-purple-400' : 'text-purple-600',
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/journal/${userId}/prompts`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.map((p: any) => ({
          ...p,
          icon: categoryIcons[p.category as keyof typeof categoryIcons],
        })));
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      // Fallback prompts
      setPrompts([
        {
          id: '1',
          category: 'emotional',
          prompt: 'What emotion are you feeling most strongly right now? Describe it without judgment.',
          icon: Heart,
        },
        {
          id: '2',
          category: 'mental',
          prompt: 'What thought pattern keeps repeating today? Is it serving you?',
          icon: Brain,
        },
        {
          id: '3',
          category: 'physical',
          prompt: 'How does your body feel right now? What is it trying to tell you?',
          icon: Zap,
        },
        {
          id: '4',
          category: 'spiritual',
          prompt: 'What brought you a moment of peace or connection today?',
          icon: Moon,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!selectedPrompt || !response.trim()) return;

    try {
      await fetch(`/api/journal/${userId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          response,
          timestamp: new Date().toISOString(),
        }),
      });
      
      setResponse('');
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`w-8 h-8 border-3 rounded-full animate-spin ${
          darkMode 
            ? 'border-purple-500 border-t-transparent' 
            : 'border-purple-600 border-t-transparent'
        }`} />
      </div>
    );
  }

  if (selectedPrompt) {
    const Icon = selectedPrompt.icon;
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setSelectedPrompt(null)}
          className={`flex items-center gap-2 text-sm font-medium ${
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          ← Back to prompts
        </button>

        {/* Selected Prompt */}
        <div className={`p-5 rounded-2xl border ${
          darkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Icon size={20} className={categoryColors[selectedPrompt.category]} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              categoryColors[selectedPrompt.category]
            }`}>
              {selectedPrompt.category}
            </span>
          </div>
          <p className={`text-base font-medium ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {selectedPrompt.prompt}
          </p>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your thoughts here... be honest, be kind to yourself."
            rows={12}
            className={`w-full px-4 py-3 rounded-xl border resize-none transition-colors ${
              darkMode
                ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
          />
          <p className={`text-xs mt-2 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {response.length} characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={saveEntry}
          disabled={!response.trim()}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
            darkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Save Entry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-xl border ${
        darkMode 
          ? 'bg-purple-900/20 border-purple-500/30' 
          : 'bg-purple-50 border-purple-200'
      }`}>
        <p className={`text-sm ${
          darkMode ? 'text-purple-200' : 'text-purple-800'
        }`}>
          💜 Choose a prompt to begin your journaling practice
        </p>
      </div>

      {/* Prompt Cards */}
      <div className="grid gap-3">
        {prompts.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <button
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`p-4 rounded-xl border text-left transition-all group hover:scale-[1.02] ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50' 
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon size={20} className={`mt-0.5 ${categoryColors[prompt.category]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${
                      categoryColors[prompt.category]
                    }`}>
                      {prompt.category}
                    </span>
                  </div>
                  <p className={`text-sm font-medium line-clamp-2 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    {prompt.prompt}
                  </p>
                </div>
                <ChevronRight size={18} className={`mt-1 transition-transform group-hover:translate-x-1 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JournalPrompts;