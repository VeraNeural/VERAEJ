'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Volume2, Menu, Loader2 } from 'lucide-react';
import WellnessHub from '@/components/WellnessHubModal';
import SidePanel from '@/components/SidePanel';

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

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWellnessHub, setShowWellnessHub] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [darkMode] = useState(false);

  // Voice state
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

  useEffect(() => {
    checkAuth();
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
      if (window.confirm('🎙️ Voice responses available with Regulator plan ($39/month)\n\nGo to upgrade page?')) {
        window.location.href = 'https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s';
      }
      return;
    }

    if (!canUseVoice) {
      if (window.confirm('Voice limit reached (20/day)\n\nUpgrade to Integrator for unlimited voice?\n\n$99/month')) {
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50/30 to-purple-100/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-purple-200/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidePanel(true)}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-slate-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
                <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 animate-pulse opacity-30" />
              </div>
              <div>
                <h1 className="text-xl font-normal text-slate-800">VERA</h1>
                <p className="text-xs text-slate-500">I'm here, listening</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWellnessHub(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 rounded-xl transition-all text-slate-700 border border-purple-200/50 shadow-sm"
            >
              <span className="text-sm font-medium">Wellness Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mb-6 shadow-lg" />
            <h2 className="text-3xl font-light text-slate-800 mb-3">
              I'm VERA. I'm here for you.
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Share what's happening in your body, and we'll explore it together. There's no rush, no judgment - just presence.
            </p>

            {/* Quick Prompts */}
            <div className="w-full max-w-xl">
              <p className="text-sm text-slate-500 mb-4">Not sure where to start? Try one of these:</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200/50 transition-all text-slate-700 text-sm shadow-sm"
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
                      ? 'bg-purple-100 text-slate-800 shadow-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-purple-100'
                  }`}
                >
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.audioUrl && (
                    <audio 
                      controls 
                      className="mt-3 w-full"
                      src={message.audioUrl}
                      autoPlay
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-purple-200/40 bg-white/90 backdrop-blur-xl px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Voice Toggle */}
            <button
              onClick={handleVoiceToggle}
              disabled={!voiceAvailable}
              className={`p-3 rounded-xl transition-all ${
                audioEnabled
                  ? 'bg-purple-500 text-white shadow-lg'
                  : voiceAvailable
                  ? 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={
                !voiceAvailable
                  ? 'Voice available with Regulator plan'
                  : !canUseVoice
                  ? `Voice limit reached (${voiceUsageToday}/${getVoiceLimit(userTier)})`
                  : audioEnabled
                  ? `Voice On (${voiceUsageToday}/${getVoiceLimit(userTier)} used)`
                  : `Voice Off (${voiceUsageToday}/${getVoiceLimit(userTier)} used)`
              }
            >
              <Volume2 size={20} />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's happening in your body..."
                className="w-full px-5 py-3 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-slate-800 placeholder-slate-400 shadow-sm"
                rows={1}
                style={{
                  minHeight: '50px',
                  maxHeight: '150px',
                }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* Voice Usage Indicator */}
          {voiceAvailable && (
            <div className="mt-2 text-xs text-slate-500 text-center">
              {audioEnabled ? '🎙️ Voice responses enabled' : 'Voice responses off'} 
              {userTier === 'regulator' && ` • ${voiceUsageToday}/20 used today`}
              {userTier === 'integrator' && ' • Unlimited'}
            </div>
          )}
        </div>
      </div>

      {/* Wellness Hub Modal */}
      {showWellnessHub && (
        <WellnessHub
          isOpen={showWellnessHub}
          onClose={() => setShowWellnessHub(false)}
          userTier={userTier}
        />
      )}

      {/* Side Panel */}
      <SidePanel
        isOpen={showSidePanel}
        onClose={() => setShowSidePanel(false)}
        darkMode={darkMode}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
      />
    </div>
  );
}
