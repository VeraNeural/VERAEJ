'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Volume2, Menu, Loader2 } from 'lucide-react';
import WellnessHub from '@/components/WellnessHubModal';
import MainNavigation from '@/components/MainNavigation';
import CourseGenerationModal from '@/components/CourseGenerationModal';
import NotificationsPanel from '@/components/NotificationsPanel';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showWellnessHub, setShowWellnessHub] = useState(false);
  const [showCourseGeneration, setShowCourseGeneration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load session from URL on mount
  useEffect(() => {
    const sessionFromUrl = searchParams.get('session');
    if (sessionFromUrl) {
      loadSession(sessionFromUrl);
    }
  }, [searchParams]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check auth on mount - COMMENTED OUT THE ORIENTATION CHECK
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/auth/signin');
        return;
      }

      // Removed orientation check - this was causing the redirect loop
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
    }
  };

  const loadSession = async (sessionIdToLoad: string) => {
    try {
      console.log('📚 Loading session:', sessionIdToLoad);
      setLoading(true);
      
      // Fetch messages for this session
      const response = await fetch(`/api/sessions/${sessionIdToLoad}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSessionId(sessionIdToLoad);
        console.log('✅ Loaded', data.messages.length, 'messages');
      }
    } catch (error) {
      console.error('❌ Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

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
          sessionId: sessionId,
          audioEnabled: audioEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Update session ID if new session was created
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        // Update URL without reloading
        router.replace(`/chat?session=${data.sessionId}`, { scroll: false });
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      if (data.audioUrl && audioEnabled) {
        playAudio(data.audioUrl);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative">
      <div className="slow-neurons-container" id="slowNeurons"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slow-neurons-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
        }

        .slow-neurons-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
          animation: neuralPulse 8s ease-in-out infinite;
        }

        @keyframes neuralPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .chat-container {
          position: relative;
          z-index: 1;
        }
      `}} />

      <div className="chat-container min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidePanel(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-slate-300" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 animate-pulse opacity-80" />
                  <div 
                    className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
                <div>
                  <h1 className="text-white font-medium text-lg">VERA</h1>
                  <p className="text-slate-400 text-xs">I'm here, listening</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationsPanel />
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 animate-pulse opacity-80" />
                  <div 
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
                <h2 className="text-2xl font-light text-white mb-2">
                  Hi. I'm VERA.
                </h2>
                <p className="text-slate-400">
                  What's present for you right now?
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4">
                  <Loader2 className="animate-spin text-purple-400" size={20} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-xl transition-all ${
                  audioEnabled
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                title={audioEnabled ? 'Voice enabled' : 'Voice disabled'}
              >
                <Volume2 size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none max-h-32"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-3">
              VERA is here to support, not replace professional care
            </p>
          </div>
        </footer>
      </div>

      {/* Side Panel */}
      <MainNavigation
        isOpen={showSidePanel}
        onClose={() => setShowSidePanel(false)}
        currentPage="chat"
      />

      {/* Modals */}
      {showWellnessHub && (
        <WellnessHub onClose={() => setShowWellnessHub(false)} />
      )}

      {showCourseGeneration && (
        <CourseGenerationModal onClose={() => setShowCourseGeneration(false)} />
      )}
    </div>
  );
}
