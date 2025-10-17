'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Volume2, Menu, Loader2, Circle } from 'lucide-react';
import WellnessHub from '@/components/WellnessHubModal';
import MainNavigation from '@/components/MainNavigation';
import CourseGenerationModal from '@/components/CourseGenerationModal';
import NotificationsPanel from '@/components/NotificationsPanel';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}

const quickPrompts = [
  { label: 'How do I feel?', text: 'I need help understanding what I\'m feeling right now' },
  { label: 'Anxious', text: 'I\'m feeling anxious and my chest is tight' },
  { label: 'Sad', text: 'I\'m feeling really sad today' },
  { label: 'Angry', text: 'I\'m feeling angry and don\'t know what to do with it' },
  { label: 'Numb', text: 'I feel disconnected and numb' },
];

const stripMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1');
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWellnessHub, setShowWellnessHub] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showCourseGeneration, setShowCourseGeneration] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [darkMode] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [userTier, setUserTier] = useState<string>('explorer');
  const [voiceUsageToday, setVoiceUsageToday] = useState(0);

  const voiceAvailable = ['regulator', 'integrator', 'test'].includes(userTier);
  
  const getVoiceLimit = (tier: string) => {
    switch(tier) {
      case 'integrator':
      case 'test':
        return Infinity;
      case 'regulator':
        return 20;
      default:
        return 0;
    }
  };

  const canUseVoice = voiceUsageToday < getVoiceLimit(userTier);

  const createSlowNeurons = () => {
    const container = document.getElementById('slowNeurons');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 40; i++) {
      const neuron = document.createElement('div');
      neuron.className = 'slow-neuron';
      neuron.style.left = Math.random() * 100 + '%';
      neuron.style.top = Math.random() * 100 + '%';
      neuron.style.animationDelay = Math.random() * 60 + 's';
      neuron.style.animationDuration = (80 + Math.random() * 40) + 's';
      
      const colors = [
        'rgba(155, 89, 182, 0.3)',
        'rgba(100, 181, 246, 0.3)',
        'rgba(177, 156, 217, 0.3)',
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      neuron.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      
      container.appendChild(neuron);
    }

    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.className = 'slow-consciousness-wave';
      wave.style.left = Math.random() * 100 + '%';
      wave.style.top = Math.random() * 100 + '%';
      wave.style.animationDelay = i * 20 + 's';
      wave.style.animationDuration = (90 + Math.random() * 30) + 's';
      container.appendChild(wave);
    }
  };

  useEffect(() => {
    checkAuth();
    createSlowNeurons();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/auth/signin');
        return;
      }
      const data = await response.json();
      setUser(data.user);
      setUserTier(data.user.subscription_tier);
      
      if (['regulator', 'integrator', 'test'].includes(data.user.subscription_tier)) {
        const usageResponse = await fetch('/api/voice-usage');
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setVoiceUsageToday(usageData.usageToday || 0);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceToggle = () => {
    if (!voiceAvailable) {
      if (window.confirm('Voice responses available with Regulator plan ($39/month)\n\n20 voice responses per day\n\nGo to upgrade page?')) {
        window.location.href = 'https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s';
      }
      return;
    }

    if (!canUseVoice) {
      if (window.confirm('Voice limit reached (20/day)\n\nUpgrade to Integrator for UNLIMITED voice responses?\n\n$99/month')) {
        window.location.href = '/pricing';
      }
      return;
    }
    
    setAudioEnabled(!audioEnabled);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          sessionId: currentSessionId,
          audioEnabled: audioEnabled && canUseVoice,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        audioUrl: data.audioUrl,
      };

      setMessages([...updatedMessages, assistantMessage]);

      if (data.audioUrl) {
        setVoiceUsageToday(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again.',
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  const handleLoadChat = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  return (
    <div className="relative">
      <div className="slow-neurons-container" id="slowNeurons"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slow-neurons-container {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .slow-neuron {
          position: absolute;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, rgba(155, 89, 182, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: slowNeuronFloat 100s infinite ease-in-out;
        }

        @keyframes slowNeuronFloat {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.2;
          }
          25% {
            transform: translate(40px, -30px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-30px, 40px) scale(1);
            opacity: 0.4;
          }
          75% {
            transform: translate(50px, 20px) scale(0.9);
            opacity: 0.3;
          }
        }

        .slow-consciousness-wave {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle,
            rgba(155, 89, 182, 0.03) 0%,
            rgba(100, 181, 246, 0.02) 30%,
            transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          animation: slowWaveBreath 100s infinite ease-in-out;
        }

        @keyframes slowWaveBreath {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          33% {
            transform: translate(-100px, 80px) scale(1.3);
            opacity: 0.3;
          }
          66% {
            transform: translate(80px, -50px) scale(1.1);
            opacity: 0.2;
          }
        }

        audio {
          height: 32px;
        }
        audio::-webkit-media-controls-panel {
          background-color: rgba(71, 85, 105, 0.5);
        }
      ` }} />

      <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 relative">
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidePanel(true)}
                className="p-2 hover:bg-slate-700/60 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-slate-200" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 animate-pulse opacity-50" />
                </div>
                <div>
                  <h1 className="text-xl font-normal text-white">VERA</h1>
                  <p className="text-xs text-slate-300">I'm here, listening</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationsPanel />
              <button
                <div className="flex items-center gap-2">
  <NotificationsPanel />
  <button
    onClick={() => setShowCourseGeneration(true)}
    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-all text-white shadow-sm text-sm font-medium flex items-center gap-1"
  >
    <Circle size={16} className="fill-white" />
    Create Course
  </button>
</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center mb-6 shadow-xl" />
              <h2 className="text-3xl font-light text-slate-800 mb-3">
                I'm VERA. I'm here for you.
              </h2>
              <p className="text-lg text-slate-800 mb-8 leading-relaxed">
                Share what's happening in your body, and we'll explore it together. There's no rush, no judgment - just presence.
              </p>

              <div className="w-full max-w-xl">
                <p className="text-sm text-slate-700 mb-4">Not sure where to start? Try one of these:</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className="px-4 py-2.5 rounded-xl bg-white/60 hover:bg-purple-100 border border-purple-300/70 transition-all text-slate-800 text-sm shadow-sm hover:shadow-md"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg border border-slate-600'
                    }`}
                  >
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.role === 'assistant' ? stripMarkdown(message.content) : message.content}
                    </div>
                    {message.audioUrl && (
                      <div className="mt-2">
                        <audio 
                          controls 
                          className="h-8 max-w-[250px] opacity-80"
                          src={message.audioUrl}
                          autoPlay
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-slate-700/50 bg-slate-800/80 backdrop-blur-xl px-6 py-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <button
                onClick={handleVoiceToggle}
                disabled={!voiceAvailable}
                className={`p-2.5 rounded-lg transition-all ${
                  audioEnabled
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : voiceAvailable
                    ? 'bg-slate-700/50 text-slate-400 hover:text-slate-300 border border-slate-600/50'
                    : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                }`}
                title={
                  !voiceAvailable
                    ? 'Voice available with Regulator plan'
                    : !canUseVoice
                    ? `Voice limit reached (${voiceUsageToday}/20)`
                    : audioEnabled
                    ? 'Voice responses on'
                    : 'Voice responses off'
                }
              >
                <Volume2 size={18} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's happening in your body..."
                  className="w-full px-5 py-3 bg-slate-700/70 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-slate-100 placeholder-slate-400 shadow-sm"
                  rows={1}
                  style={{
                    minHeight: '50px',
                    maxHeight: '150px',
                  }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:bg-gray-600 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            {voiceAvailable && audioEnabled && (
              <div className="mt-2 text-xs text-slate-400 text-center">
                Voice enabled
                {userTier === 'regulator' && ` • ${voiceUsageToday}/20 today`}
              </div>
            )}
          </div>
        </div>

        {showWellnessHub && user && (
          <WellnessHub
            isOpen={showWellnessHub}
            onClose={() => setShowWellnessHub(false)}
            userId={user.id}
            darkMode={darkMode}
          />
        )}

        <MainNavigation
  isOpen={showSidePanel}
  onClose={() => setShowSidePanel(false)}
  currentPage="chat"
/>

        {showCourseGeneration && (
          <CourseGenerationModal
            isOpen={showCourseGeneration}
            onClose={() => setShowCourseGeneration(false)}
          />
        )}
      </div>
    </div>
  );
}
