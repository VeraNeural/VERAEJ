'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Menu, Moon, Sun, Volume2, VolumeX, AlertCircle, X, Shield, FileText, AlertTriangle, Heart, Compass, Wind, Loader2 } from 'lucide-react';
import { useDarkMode } from '@/lib/use-dark-mode';
import SidePanel from './SidePanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isUpgradePrompt?: boolean;
  isError?: boolean;
  suggestedActions?: any[];
}

export default function ChatWindow() {
  // 1. ALL useState hooks
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [messageLimit, setMessageLimit] = useState<{ used: number; limit: number } | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showBreathingOrb, setShowBreathingOrb] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 2. Custom hooks
  const { darkMode, toggleDarkMode, mounted } = useDarkMode();

  // 3. useRef hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 4. DEFINE FUNCTIONS BEFORE useEffect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Voice logic
  const voiceAvailable = ['regulator', 'integrator', 'test'].includes(userTier);

  // Voice limits by tier
  const getVoiceLimit = (tier: string) => {
    switch(tier) {
      case 'integrator':
      case 'test':
        return Infinity;
      case 'regulator':
        return 20;
      case 'explorer':
        return 5;
      default:
    // Fetch voice usage on mount
    }
  };

  // Voice usage tracking
  const [voiceUsageToday, setVoiceUsageToday] = useState(0);
  const voiceLimit = getVoiceLimit(userTier) ?? 0;
  const canUseVoice = voiceUsageToday < voiceLimit;

  // Fetch voice usage on mount (only once per voiceAvailable change)
  useEffect(() => {
    const fetchVoiceUsage = async () => {
      try {
        const response = await fetch('/api/voice-usage');
        if (response.ok) {
          const data = await response.json();
          setVoiceUsageToday(data.usageToday);
        }
      } catch (error) {
        console.error('Failed to fetch voice usage:', error);
      }
    };
    if (voiceAvailable) {
      fetchVoiceUsage();
    }
  }, [voiceAvailable]);

  // Voice toggle handler
  const handleVoiceToggle = () => {
    if (!voiceAvailable) {
      alert('🎙️ Voice responses available with:\n\n• Regulator ($39/mo) - 20 voices/day\n• Integrator ($79/mo) - Unlimited\n\nUpgrade to hear VERA speak!');
      return;
    }
    if (!canUseVoice && userTier === 'regulator') {
      alert(`You\'ve used all ${voiceLimit} voice messages today. Upgrade to Integrator for unlimited voice!`);
      return;
    }
    setAudioEnabled(!audioEnabled);
  };

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    if (!customMessage) setInput('');
    setIsLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Send FULL conversation history to Claude
      const conversationHistory = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory, // Send full history
          audioEnabled: audioEnabled,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I hear you.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Play audio if available
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(err => {
          console.error('Audio playback failed:', err);
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. NOW useEffect can call those functions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          let tier = 'free';
          if (user.subscription_status === 'trial') {
            const trialEndsAt = new Date(user.trialEndsAt);
            if (new Date() < trialEndsAt) {
              tier = 'explorer';
            }
          } else if (user.subscription_status === 'active') {
            tier = user.subscription_tier || 'explorer';
          }
          // Check if test mode
          if (user.test_mode) {
            tier = 'test';
            console.log('🧪 TEST MODE ACTIVE');
          }
          setUserTier(tier);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUserTier('free');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 6. Early return after all hooks
  if (!mounted) {
    return null;
  }

  // 7. Other functions
  const quickMessages = {
    regulate: "I need help regulating. My nervous system feels overwhelmed.",
    decode: "Help me understand what my body is trying to tell me.",
    ground: "I feel disconnected. Help me ground back into my body.",
    senses: "Help me reconnect through my five senses.",
    redirect: "My thoughts are racing. Help me redirect to my body."
  };

  const handleQuickAction = (action: string) => {
    sendMessage(quickMessages[action as keyof typeof quickMessages]);
  };

  const handleSuggestedAction = (action: string) => {
    if (action === 'calm') {
      activateCalmMode();
    } else {
      handleQuickAction(action);
    }
  };

  const activateCalmMode = () => {
    if (!darkMode) toggleDarkMode();
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      moon: Moon,
      heart: Heart,
      wind: Wind,
      compass: Compass
    };
    const Icon = icons[iconName] || Heart;
    return <Icon size={16} />;
  };

  // 8. Return JSX
  return (
    <div className={`flex flex-col h-screen transition-colors duration-1000 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50/40 via-purple-50/30 to-blue-50/20'
    }`}>
      {/* Living Breathing Orb Overlay */}
      {showBreathingOrb && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="vera-orb-overlay">
            <div className="vera-living-orb">
              <div className="vera-inner-glow"></div>
            </div>
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
              <p className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                Breathe with VERA
              </p>
              <button
                onClick={() => setShowBreathingOrb(false)}
                className={`mt-2 text-xs ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'} underline`}
              >
                Hide orb
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`backdrop-blur-xl border-b px-6 py-4 shadow-sm transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-900/80 border-purple-500/20' 
          : 'bg-white/80 border-rose-200/30'
      }`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500`}>
              VERA
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidePanelOpen(!sidePanelOpen)}
              className={`p-2 rounded-xl transition-all border ${
                darkMode 
                  ? 'bg-indigo-900/50 text-purple-300 border-purple-500/30 hover:bg-indigo-900/70' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Menu"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all border ${
                darkMode 
                  ? 'bg-indigo-900/50 text-purple-300 border-purple-500/30 hover:bg-indigo-900/70' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setShowCrisisModal(true)}
              className={`p-2 rounded-xl transition-all border ${
                darkMode
                  ? 'bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border-rose-500/30'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-600 border-rose-200/50'
              }`}
              title="Crisis Resources"
            >
              <AlertCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Crisis Modal - abbreviated for space */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-6 max-w-md ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <button onClick={() => setShowCrisisModal(false)} className="float-right">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Crisis Resources</h2>
            <p className="mb-4">If you're in crisis, call 988 (US/Canada) or visit findahelpline.com</p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-6 py-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                  : darkMode
                    ? 'bg-slate-800/50 text-white'
                    : 'bg-white text-slate-800'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-2 opacity-60">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`px-6 py-4 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`backdrop-blur-xl border-t px-4 py-4 shadow-lg transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-900/90 border-purple-500/20'  // Dark mode
          : 'bg-white/80 border-rose-200/30'        // Light mode
      }`}>
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleQuickAction('regulate')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                darkMode
                  ? 'bg-rose-900/50 hover:bg-rose-900/70 text-rose-200 border-rose-500/30'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-200/50'
              }`}>
              <Heart size={16} />
              Regulate
            </button>
            <button
              onClick={() => handleQuickAction('decode')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                darkMode
                  ? 'bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 border-purple-500/30'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200/50'
              }`}>
              <Compass size={16} />
              Decode
            </button>
            <button
              onClick={() => handleQuickAction('ground')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap ${
                darkMode
                  ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-200 border-blue-500/30'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200/50'
              }`}>
              <Wind size={16} />
              Ground
            </button>
          </div>

          {/* Input Row */}
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's happening in your body..."
              className={`flex-1 border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-medium shadow-md ${
                isLoading || !input.trim()
                  ? 'bg-slate-600 cursor-not-allowed text-slate-300'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
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
          {/* Voice Toggle & Info */}
          <div className="flex items-center justify-between">
            {/* Voice Toggle */}
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm ${
                !voiceAvailable || !canUseVoice
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600'
                  : audioEnabled 
                    ? darkMode 
                      ? 'bg-purple-900/50 text-purple-200 border-purple-500/30' 
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                    : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">
                {!voiceAvailable 
                  ? 'Voice (Upgrade)' 
                  : !canUseVoice 
                    ? `Voice (${voiceUsageToday}/${voiceLimit === Infinity ? '∞' : voiceLimit})` 
                    : audioEnabled 
                      ? `Voice On (${voiceUsageToday}/${voiceLimit === Infinity ? '∞' : voiceLimit})` 
                      : 'Voice Off'}
              </span>
            </button>
      {/* Show test mode badge if in test */}
      {userTier === 'test' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🧪 TEST MODE
          </div>
        </div>
      )}
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel isOpen={sidePanelOpen} onClose={() => setSidePanelOpen(false)} darkMode={darkMode} />

      {/* Audio with debug handlers */}
      <audio 
        ref={audioRef}
        className="hidden"
        onError={(e) => console.error('Audio error:', e)}
        onPlay={() => console.log('🎙️ Audio playing')}
        onEnded={() => console.log('🎙️ Audio ended')}
      />

      {/* Temporary button to test audio playback manually */}
      <button
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => {
          if (audioRef.current) {
            const testAudio = 'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBK8AAAAAAAAAABUgJAUHQQAB9AAABYaFbtpuAAAAAAAAAAAAAAAAAAAA';
            audioRef.current.src = testAudio;
            audioRef.current.play()
              .then(() => console.log('✅ Test audio works!'))
              .catch(err => console.error('❌ Audio blocked:', err));
          }
        }}
      >
        Test Audio
      </button>
    </div>
  );
}