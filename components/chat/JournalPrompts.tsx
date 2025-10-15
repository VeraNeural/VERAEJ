import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Heart, Brain, Zap, Moon, Clock, ArrowLeft } from 'lucide-react';

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

interface JournalEntry {
  id: string;
  prompt_text: string;
  category: string;
  response: string;
  created_at: string;
}

const JournalPrompts: React.FC<JournalPromptsProps> = ({ darkMode, userId }) => {
  const [view, setView] = useState<'prompts' | 'entries'>('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
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
    if (view === 'entries') {
      fetchEntries();
    }
  }, [view]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/journal/${userId}/entries`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!selectedPrompt || !response.trim()) return;

    try {
      const result = await fetch(`/api/journal/${userId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          response,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (result.ok) {
        setResponse('');
        setSelectedPrompt(null);
        // Show success message or switch to entries view
        setView('entries');
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // View: Single Entry Detail
  if (selectedEntry) {
    const categoryKey = selectedEntry.category as keyof typeof categoryIcons;
    const Icon = categoryIcons[categoryKey] || BookOpen;
    
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedEntry(null)}
          className={`flex items-center gap-2 text-sm font-medium ${
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          <ArrowLeft size={16} /> Back to entries
        </button>

        <div className={`p-5 rounded-2xl border ${
          darkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Icon size={20} className={categoryColors[categoryKey]} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              categoryColors[categoryKey]
            }`}>
              {selectedEntry.category}
            </span>
            <Clock size={14} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {formatDate(selectedEntry.created_at)}
            </span>
          </div>
          
          <p className={`text-sm font-medium mb-4 ${
            darkMode ? 'text-purple-300' : 'text-purple-700'
          }`}>
            {selectedEntry.prompt_text}
          </p>
          
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-slate-900/50' : 'bg-slate-50'
          }`}>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {selectedEntry.response}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View: Writing New Entry
  if (selectedPrompt) {
    const Icon = selectedPrompt.icon;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedPrompt(null)}
          className={`flex items-center gap-2 text-sm font-medium ${
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }`}
        >
          <ArrowLeft size={16} /> Back to prompts
        </button>

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

  // View: Past Entries List
  if (view === 'entries') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Past Entries
          </h3>
          <button
            onClick={() => setView('prompts')}
            className={`text-sm font-medium ${
              darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            New Entry
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`w-8 h-8 border-3 rounded-full animate-spin ${
              darkMode 
                ? 'border-purple-500 border-t-transparent' 
                : 'border-purple-600 border-t-transparent'
            }`} />
          </div>
        ) : entries.length === 0 ? (
          <div className={`p-8 rounded-xl border text-center ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700/50' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <BookOpen size={40} className={`mx-auto mb-3 ${
              darkMode ? 'text-slate-600' : 'text-slate-300'
            }`} />
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              No journal entries yet. Start writing to build your personal protocol!
            </p>
            <button
              onClick={() => setView('prompts')}
              className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                darkMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const categoryKey = entry.category as keyof typeof categoryIcons;
              const Icon = categoryIcons[categoryKey] || BookOpen;
              
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                    darkMode 
                      ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50' 
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={18} className={`mt-1 ${categoryColors[categoryKey]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          categoryColors[categoryKey]
                        }`}>
                          {entry.category}
                        </span>
                        <Clock size={12} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm font-medium mb-2 line-clamp-1 ${
                        darkMode ? 'text-purple-300' : 'text-purple-700'
                      }`}>
                        {entry.prompt_text}
                      </p>
                      <p className={`text-sm line-clamp-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {entry.response}
                      </p>
                    </div>
                    <ChevronRight size={18} className={`mt-1 ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // View: Prompt Selection
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className={`flex-1 p-4 rounded-xl border ${
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
        <button
          onClick={() => setView('entries')}
          className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            darkMode
              ? 'bg-slate-800 text-purple-300 hover:bg-slate-700'
              : 'bg-white text-purple-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          View Entries
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`w-8 h-8 border-3 rounded-full animate-spin ${
            darkMode 
              ? 'border-purple-500 border-t-transparent' 
              : 'border-purple-600 border-t-transparent'
          }`} />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default JournalPrompts;
