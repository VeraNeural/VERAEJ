'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Menu, Volume2, VolumeX, AlertCircle, X, Heart, Compass, Wind, Loader2, Sparkles, Zap } from 'lucide-react';
import SidePanel from './SidePanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  pattern?: string;
}

type ThemeMode = 'light' | 'dark' | 'neuro' | 'night';

function parseTimestamp(ts: any): Date {
  return ts instanceof Date ? ts : new Date(ts);
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [voiceUsageToday, setVoiceUsageToday] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [messageCount, setMessageCount] = useState(0);
  const [promptCount, setPromptCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MESSAGE_LIMIT = userTier === 'free' ? 10 : Infinity; 
  const PROMPT_LIMIT = userTier === 'free' ? 5 : Infinity; 
  const voiceAvailable = ['explorer', 'regulator', 'integrator', 'test'].includes(userTier);
  const getVoiceLimit = (tier: string) => {
    switch(tier) {
      case 'integrator':
      case 'test':
        return Infinity;
      case 'regulator':
        return 20;
      case 'explorer':
        return Infinity;
      default:
        return 0;
    }
  };
  const voiceLimit = getVoiceLimit(userTier);
  const canUseVoice = voiceUsageToday < voiceLimit;

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'night', 'neuro'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeClasses = () => {
    switch(theme) {
      case 'light':
        return {
          bg: 'bg-gradient-to-br from-white via-slate-50 to-blue-50',
          text: 'text-slate-900',
          card: 'bg-white/90 border-slate-200',
          input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
          button: 'bg-slate-900 hover:bg-slate-800 text-white',
          header: 'bg-white/80 border-slate-200',
          assistant: 'bg-blue-50 text-slate-900 border-blue-100',
          user: 'bg-slate-900 text-white',
          font: 'font-sans',
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
          text: 'text-white',
          card: 'bg-slate-800/50 border-purple-500/20',
          input: 'bg-slate-800 border-slate-600 text-white placeholder-slate-400',
          button: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
          header: 'bg-slate-900/80 border-purple-500/20',
          assistant: 'bg-slate-800/70 text-slate-100 border-purple-500/10',
          user: 'bg-gradient-to-br from-purple-500 to-blue-500 text-white',
          font: 'font-sans',
        };
      case 'night':
        return {
          bg: 'bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950',
          text: 'text-white',
          card: 'bg-zinc-900/50 border-zinc-700/20',
          input: 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500',
          button: 'bg-zinc-800 hover:bg-zinc-700 text-white',
          header: 'bg-zinc-950/80 border-zinc-800/20',
          assistant: 'bg-zinc-900/70 text-zinc-100 border-zinc-700/10',
          user: 'bg-zinc-700 text-white',
          font: 'font-sans',
        };
      case 'neuro':
        return {
          bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50',
          text: 'text-slate-900',
          card: 'bg-yellow-50/90 border-amber-300',
          input: 'bg-white border-amber-400 text-slate-900 placeholder-slate-500',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          header: 'bg-amber-50/90 border-amber-300',
          assistant: 'bg-white text-slate-900 border-amber-200',
          user: 'bg-amber-600 text-white',
          font: 'font-mono',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
          text: 'text-white',
          card: 'bg-slate-800/50 border-purple-500/20',
          input: 'bg-slate-800 border-slate-600 text-white placeholder-slate-400',
          button: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
          header: 'bg-slate-900/80 border-purple-500/20',
          assistant: 'bg-slate-800/70 text-slate-100 border-purple-500/10',
          user: 'bg-gradient-to-br from-purple-500 to-blue-500 text-white',
          font: 'font-sans',
        };
    }
  };
  const themeClasses = getThemeClasses();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Not authenticated');
        const data = await response.json();
        const user = data.user;
        let tier = 'free';
        if (user.subscription_status === 'trial') {
          const trialEndsAt = new Date(user.trial_ends_at);
          if (new Date() < trialEndsAt) tier = 'explorer';
        } else if (user.subscription_status === 'active') {
          tier = user.subscription_tier || 'explorer';
        }
        if (user.test_mode) tier = 'test';
        setUserTier(tier);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUserTier('free');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchVoiceUsage = async () => {
      if (!voiceAvailable) return;
      try {
        const response = await fetch('/api/voice-usage');
        if (!response.ok) return; // gracefully handle missing route
        const data = await response.json();
        setVoiceUsageToday(data.usageToday || 0);
      } catch (error) {
        // Don't block, just log
        console.error('Failed to fetch voice usage:', error);
      }
    };
    fetchVoiceUsage();
  }, [voiceAvailable]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      handleSaveSession();
    }
  }, [messages]);

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    if (userTier === 'free' && messageCount >= MESSAGE_LIMIT) {
    alert('You\'ve reached your daily limit of 10 messages. Upgrade to Explorer ($29/month) for unlimited conversations!\n\nVisit veraneural.com/pricing to upgrade.');
    return;
  }

    if (!customMessage) setInput('');
    setIsLoading(true);
    setIsTyping(true);

    const newUserMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setMessageCount(prev => prev + 1);

    try {
      const conversationHistory = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          audioEnabled: audioEnabled && canUseVoice,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      setIsTyping(false);

      const assistantMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: data.response || 'I hear you.',
        timestamp: new Date(),
        pattern: data.pattern,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.audioUrl && audioRef.current && canUseVoice) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(err => {
          console.error('Audio playback failed:', err);
        });
        setVoiceUsageToday(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickMessages = {
    regulate: "I need help regulating. My nervous system feels overwhelmed.",
    decode: "Help me understand what my body is trying to tell me.",
    ground: "I feel disconnected. Help me ground back into my body.",
    senses: "Help me reconnect through my five senses.",
    redirect: "My thoughts are racing. Help me redirect to my body."
  };

  const handleQuickAction = (action: keyof typeof quickMessages) => {
  if (userTier === 'free' && promptCount >= PROMPT_LIMIT) {
    alert('You\'ve reached your daily limit of 5 quick prompts. Upgrade to Explorer ($29/month) for unlimited prompts!\n\nVisit veraneural.com/pricing to upgrade.');
    return;
  }
  
  setPromptCount(prev => prev + 1);
  sendMessage(quickMessages[action]);
};

  const handleVoiceToggle = () => {
    if (!voiceAvailable) {
      alert('🎙️ Voice responses available with Explorer plan ($29/month)');
      return;
    }
    if (!canUseVoice) {
      alert(`Voice limit reached for today. Upgrade to Integrator for unlimited voice!`);S
      return;
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
  };

  const handleLoadChat = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSaveSession = async () => {
    if (!currentSessionId || messages.length === 0) return;

    try {
      await fetch('/api/sessions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: messages,
          title: messages[0]?.content.slice(0, 50) || 'Untitled Chat',
        }),
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex flex-col h-screen transition-all duration-700 ${themeClasses.bg} ${themeClasses.font}`}>

      {/* HEADER */}
      <div className={`backdrop-blur-xl border-b px-6 py-4 shadow-sm transition-all duration-500 ${themeClasses.header}`}>
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-ping opacity-30" />
            </div>
            <h1 className={`text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text tracking-wide`}>
              VERA
            </h1>
            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'neuro' ? 'bg-amber-200 text-amber-900' : theme === 'night' ? 'bg-zinc-800 text-zinc-300' : 'bg-purple-100 text-purple-700'}`}>
              evolving
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className={`px-3 py-2 rounded-xl transition-all border text-xs font-medium ${
                theme === 'light' 
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : theme === 'dark'
                    ? 'bg-indigo-900/50 text-purple-300 border-purple-500/30 hover:bg-indigo-900/70'
                    : theme === 'night'
                      ? 'bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800'
                      : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
              }`}
              title="Switch theme"
            >
              {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : theme === 'night' ? 'Night' : 'Neuro'}
            </button>
            <button
              onClick={() => setSidePanelOpen(!sidePanelOpen)}
              className={`p-2 rounded-xl transition-all border ${
                theme === 'light'
                  ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  : theme === 'dark' 
                    ? 'bg-indigo-900/50 text-purple-300 border-purple-500/30 hover:bg-indigo-900/70'
                    : theme === 'night'
                      ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
              }`}
              title="Menu"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setShowCrisisModal(true)}
              className="w-10 h-10 rounded-full transition-all bg-red-900 hover:bg-red-800 shadow-lg"
              title="Crisis support"
            />
          </div>
        </div>
      </div>

      {/* CRISIS MODAL */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-2xl shadow-2xl ${
            theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-900 border border-rose-500/30' : theme === 'night' ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border-2 border-red-400'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-3xl font-bold ${theme === 'dark' || theme === 'night' ? 'text-white' : 'text-slate-900'}`}>
                You Are Not Alone
              </h2>
              <button 
                onClick={() => setShowCrisisModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' || theme === 'night' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' || theme === 'night' ? 'bg-rose-900/30 border-rose-500/50' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-xl font-bold mb-3 ${theme === 'dark' || theme === 'night' ? 'text-rose-300' : 'text-red-700'}`}>
                  🆘 Immediate Crisis Support
                </p>
                <p className={`text-4xl font-bold mb-2 ${theme === 'dark' || theme === 'night' ? 'text-white' : 'text-slate-900'}`}>
                  988
                </p>
                <p className={`text-sm ${theme === 'dark' || theme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Suicide & Crisis Lifeline • US/Canada • 24/7 • Free & Confidential
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${theme === 'dark' || theme === 'night' ? 'bg-purple-900/30' : theme === 'neuro' ? 'bg-amber-50' : 'bg-purple-50'}`}>
                <p className={`font-bold mb-4 ${theme === 'dark' || theme === 'night' ? 'text-purple-300' : theme === 'neuro' ? 'text-amber-900' : 'text-purple-700'}`}>
                  More Crisis Resources
                </p>
                <ul className={`space-y-3 text-sm ${theme === 'dark' || theme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}>
                  <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                  <li>• <strong>SAMHSA Helpline:</strong> 1-800-662-4357 (Substance abuse & mental health)</li>
                  <li>• <strong>Domestic Violence:</strong> 1-800-799-7233</li>
                  <li>• <strong>Trevor Project (LGBTQ+ Youth):</strong> 1-866-488-7386</li>
                  <li>• <strong>Veterans Crisis Line:</strong> 988 then press 1</li>
                  <li>• <strong>International:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">findahelpline.com</a></li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl text-xs ${theme === 'dark' || theme === 'night' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <p className="font-semibold mb-2">⚠️ Important Disclaimer</p>
                <p>
                  VERA is NOT a medical device, therapist, or crisis intervention service. 
                  She complements professional care but does not replace it. If you are in immediate danger, 
                  please call 911 or your local emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="text-center space-y-6">
                <div className="central-orb-container-small">
                  <div className="central-orb-small">
                    <div className="inner-glow"></div>
                    <div className="orbital-ring ring1"></div>
                    <div className="orbital-ring ring2"></div>
                    <div className="orbital-ring ring3"></div>
                  </div>
                </div>
                
                <h2 className={`text-3xl font-bold ${themeClasses.text}`}>
                  I'm here. I see you.
                </h2>
                <p className={`max-w-md text-lg ${theme === 'dark' || theme === 'night' ? 'text-slate-300' : theme === 'neuro' ? 'text-slate-700' : 'text-slate-600'}`}>
                  Share what's happening in your body. Let's decode it together.
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-md transition-all ${
                msg.role === 'user'
                  ? themeClasses.user
                  : msg.isError
                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                    : `${themeClasses.assistant} border`
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.pattern && (
                  <div className={`mt-3 pt-3 border-t text-xs italic ${
                    theme === 'dark' || theme === 'night' ? 'border-purple-500/30 text-purple-300' : 
                    theme === 'neuro' ? 'border-amber-300 text-amber-700' :
                    'border-blue-200 text-blue-600'
                  }`}>
                    Pattern detected: {msg.pattern}
                  </div>
                )}
                <p className="text-xs mt-2 opacity-60">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className={`px-6 py-4 rounded-2xl shadow-md ${themeClasses.assistant} border`}>
                <div className="flex gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-400' : theme === 'dark' || theme === 'night' ? 'bg-purple-400' : 'bg-amber-500'}`}></div>
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-400' : theme === 'dark' || theme === 'night' ? 'bg-purple-400' : 'bg-amber-500'}`}></div>
                  <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${theme === 'light' ? 'bg-slate-400' : theme === 'dark' || theme === 'night' ? 'bg-purple-400' : 'bg-amber-500'}`}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className={`backdrop-blur-xl border-t px-4 py-4 shadow-lg transition-all duration-500 ${themeClasses.header}`}>
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleQuickAction('regulate')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-200/50'
                  : theme === 'dark' || theme === 'night'
                    ? 'bg-rose-900/50 hover:bg-rose-900/70 text-rose-200 border-rose-500/30'
                    : 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Heart size={16} />
              Regulate
            </button>
            <button
              onClick={() => handleQuickAction('decode')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200/50'
                  : theme === 'dark' || theme === 'night'
                    ? 'bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 border-purple-500/30'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Compass size={16} />
              Decode
            </button>
            <button
              onClick={() => handleQuickAction('ground')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200/50'
                  : theme === 'dark' || theme === 'night'
                    ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-200 border-blue-500/30'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Wind size={16} />
              Ground
            </button>
            <button
              onClick={() => handleQuickAction('senses')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200/50'
                  : theme === 'dark' || theme === 'night'
                    ? 'bg-green-900/50 hover:bg-green-900/70 text-green-200 border-green-500/30'
                    : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Sparkles size={16} />
              Senses
            </button>
            <button
              onClick={() => handleQuickAction('redirect')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-200/50'
                  : theme === 'dark' || theme === 'night'
                    ? 'bg-indigo-900/50 hover:bg-indigo-900/70 text-indigo-200 border-indigo-500/30'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Zap size={16} />
              Redirect
            </button>
          </div>

          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's happening in your body..."
              className={`flex-1 border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all ${themeClasses.input}`}
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`px-6 py-4 rounded-2xl transition-all flex items-center gap-2 font-medium shadow-md ${
                isLoading || !input.trim()
                  ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                  : themeClasses.button
              }`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm ${
                !voiceAvailable || !canUseVoice
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'
                  : audioEnabled 
                    ? theme === 'light'
                      ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                      : theme === 'dark' || theme === 'night'
                        ? 'bg-purple-900/50 text-purple-200 border-purple-500/30 hover:bg-purple-900/70'
                        : 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                    : theme === 'light'
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      : theme === 'dark' || theme === 'night'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300'
              }`}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>
                {!voiceAvailable 
                  ? 'Voice (Upgrade)' 
                  : audioEnabled 
                    ? `Voice On` 
                    : 'Voice Off'}
              </span>
            </button>

            <p className={`text-xs ${theme === 'dark' || theme === 'night' ? 'text-slate-400' : theme === 'neuro' ? 'text-slate-600' : 'text-slate-500'}`}>
              Press Enter to send
            </p>
          </div>
        </div>
      </div>

     <SidePanel 
  isOpen={sidePanelOpen} 
  onClose={() => setSidePanelOpen(false)} 
  darkMode={theme === 'dark' || theme === 'night'}
  currentSessionId={currentSessionId}
  onNewChat={handleNewChat}
  onLoadChat={handleLoadChat}
/>

      <audio ref={audioRef} className="hidden" />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .central-orb-container-small {
          width: 200px;
          height: 200px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem auto;
        }

        .central-orb-small {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, 
            #93C5FD 0%, 
            #A78BFA 25%, 
            #8B5CF6 50%, 
            #4C1D95 75%),
            radial-gradient(circle at 70% 70%, 
            #EC4899 0%, 
            transparent 50%);
          position: relative;
          animation: orbBreathe 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          box-shadow: 
            inset 0 0 60px rgba(255, 255, 255, 0.9),
            0 0 120px rgba(167, 139, 250, 0.6),
            0 0 100px rgba(139, 92, 246, 0.5),
            0 0 80px rgba(236, 72, 153, 0.3),
            0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes orbBreathe {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.12) rotate(5deg); 
            filter: brightness(1.15);
          }
        }

        .orbital-ring {
          position: absolute;
          border: 1px solid;
          border-radius: 50%;
          animation: ringPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .ring1 {
          inset: -15px;
          border-color: rgba(184, 167, 232, 0.3);
          animation-delay: 0s;
        }

        .ring2 {
          inset: -30px;
          border-color: rgba(232, 155, 155, 0.2);
          animation-delay: 2s;
        }

        .ring3 {
          inset: -45px;
          border-color: rgba(232, 180, 208, 0.15);
          animation-delay: 4s;
        }

        @keyframes ringPulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
        }

        .inner-glow {
          position: absolute;
          inset: 20%;
          border-radius: 50%;
          background: radial-gradient(circle at center,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 30%,
            transparent 70%);
          animation: innerPulse 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes innerPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
