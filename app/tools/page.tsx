'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Lock } from 'lucide-react';

export default function ToolsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        const data = await response.json();
        setUser(data.user);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="slow-neurons-container" id="slowNeurons"></div>
      </div>
    );
  }

  const tier = user?.subscription_tier || 'explorer';
  const isExplorer = tier === 'explorer';
  const isRegulator = ['regulator', 'integrator', 'test'].includes(tier);

  const tools = [
    {
      id: 'dashboard',
      title: 'Wellness Dashboard',
      description: 'Track your nervous system patterns and progress over time',
      color: 'from-emerald-400 to-teal-400',
      locked: isExplorer,
      requiresTier: 'Regulator',
    },
    {
      id: 'breathwork',
      title: 'Breathwork',
      description: 'VERA guides you through breathwork to regulate your nervous system',
      color: 'from-cyan-400 to-blue-400',
      locked: false,
    },
    {
      id: 'body-scan',
      title: 'Body Scan',
      description: 'VERA helps you scan your body and notice what needs attention',
      color: 'from-rose-400 to-pink-400',
      locked: false,
    },
    {
      id: 'pattern-recognition',
      title: 'Pattern Recognition',
      description: 'VERA works with you to identify your adaptive codes and patterns',
      color: 'from-purple-400 to-indigo-400',
      locked: false,
    },
    {
      id: 'journaling',
      title: 'Journaling with VERA',
      description: 'VERA guides you through 5 reflective journal prompts daily',
      color: 'from-amber-400 to-orange-400',
      locked: false,
    },
  ];

  const openTool = (toolId: string, locked: boolean) => {
    if (locked) return; // Don't open if locked
    
    if (toolId === 'dashboard') {
      router.push('/dashboard');
    } else {
      setSelectedTool(toolId);
    }
  };

  const closeTool = () => {
    setSelectedTool(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative">
      {/* Neural Background */}
      <div className="slow-neurons-container fixed inset-0 opacity-30" id="slowNeurons"></div>

      {/* Header */}
      <header className="relative bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/chat')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Back to Chat
          </button>
          <h1 className="text-2xl font-light text-white">Wellness Tools</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Tools Grid */}
      <div className="relative max-w-6xl mx-auto p-8">
        <p className="text-slate-400 text-center mb-8">
          VERA guides you through these tools to support your nervous system
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="relative">
              <button
                onClick={() => openTool(tool.id, tool.locked || false)}
                disabled={tool.locked}
                className={`group relative w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border transition-all text-left ${
                  tool.locked
                    ? 'border-slate-700/50 opacity-60 cursor-not-allowed'
                    : 'border-slate-700/50 hover:border-purple-500/50'
                }`}
              >
                {/* Orb */}
                <div className="relative w-20 h-20 mb-6">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${tool.color} animate-pulse opacity-80`} />
                  <div 
                    className={`absolute inset-2 rounded-full bg-gradient-to-br ${tool.color} animate-pulse`}
                    style={{ animationDelay: '0.5s' }}
                  />
                  {tool.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-full">
                      <Lock size={24} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-medium text-white mb-2">{tool.title}</h3>
                <p className="text-slate-400">{tool.description}</p>

                {tool.locked ? (
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 mb-2">
                      Requires {tool.requiresTier} tier
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/pricing');
                      }}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      Upgrade to unlock
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-purple-400 group-hover:text-purple-300 text-sm font-medium">
                    Start Session
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Modal */}
      {selectedTool && (
        <ToolModal toolId={selectedTool} onClose={closeTool} />
      )}
    </div>
  );
}

// Tool Modal Component (same as before)
function ToolModal({ toolId, onClose }: { toolId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startSession();
  }, [toolId]);

  const startSession = async () => {
    setLoading(true);
    
    const toolPrompts: { [key: string]: string } = {
      'breathwork': "Hi! I'm here to guide you through breathwork. Let's find a comfortable position. Are you ready to begin?",
      'body-scan': "Hello. I'm going to guide you through a body scan. Find a comfortable position and let me know when you're ready to start.",
      'pattern-recognition': "Hey. Let's explore your patterns together. What's been coming up for you lately that you'd like to understand better?",
      'journaling': "Hi! I have some reflective prompts for you today. Ready to explore what's present for you?",
    };

    const initialMessage = toolPrompts[toolId] || "Hi! How can I support you today?";
    
    setMessages([{ role: 'assistant', content: initialMessage }]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          toolContext: toolId,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toolTitles: { [key: string]: string } = {
    'breathwork': 'Breathwork with VERA',
    'body-scan': 'Body Scan with VERA',
    'pattern-recognition': 'Pattern Recognition with VERA',
    'journaling': 'Journaling with VERA',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl w-full max-w-3xl h-[600px] flex flex-col border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* VERA Orb */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 animate-pulse opacity-80" />
              <div 
                className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
            <h2 className="text-xl font-light text-white">{toolTitles[toolId]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl p-4">
                <Loader2 className="animate-spin text-purple-400" size={20} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
