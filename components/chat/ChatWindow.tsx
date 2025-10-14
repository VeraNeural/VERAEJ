// Message type interface
import { trackEvent } from '@/lib/analytics';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isUpgradePrompt?: boolean;
  isError?: boolean;
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Volume2, VolumeX, AlertCircle, X, Heart, Wind, Compass, Moon, Sun, Pause, Eye, MessageCircle, Shield, FileText, AlertTriangle } from 'lucide-react';

export default function ChatWindow() {

  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Hi, I\'m VERA and I am here. What is happening in your body right now—chest, throat, gut, or skin? Start there.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showBreathingOrb, setShowBreathingOrb] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Tier-Based Voice Access
  const [userTier, setUserTier] = useState<string>('free'); // Will be set from API

  useEffect(() => {
    // Fetch user tier from API
    const fetchUserTier = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.user.subscriptionStatus || 'free');
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error);
      }
    };
    fetchUserTier();
  }, []);

  // Check if voice is available for this tier
  const voiceAvailable = ['regulator', 'integrator'].includes(userTier);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // New send message handler with message limit enforcement and upgrade prompt
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setIsLoading(true);
    setInput('');

    // Create user message
    const userMessage: Message = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          audioEnabled
        })
      });

      if (response.status === 429) {
        // Message limit reached, show upgrade prompt
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2),
            role: 'assistant',
            content: 'You have reached your daily message limit.',
            timestamp: new Date(),
            isUpgradePrompt: true
          }
        ]);
        trackEvent.upgradePromptShown(userTier, 'explorer');
        return;
      }

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Emotional triggers (reuse logic)
      const overwhelmKeywords = ['overwhelm', 'too much', 'overstimulated', 'anxiety', 'panic', 'intense', 'can\'t handle'];
      const angerKeywords = ['angry', 'mad', 'furious', 'rage', 'pissed', 'frustrated'];
      const sadKeywords = ['sad', 'depressed', 'crying', 'tears', 'hopeless', 'grief'];
      const disconnectedKeywords = ['numb', 'disconnected', 'floating', 'unreal', 'dissociat'];
      const spiralKeywords = ['spiral', 'racing thoughts', 'can\'t stop thinking', 'ruminating'];
      const lowerText = textToSend.toLowerCase();
      const isOverwhelmed = overwhelmKeywords.some(keyword => lowerText.includes(keyword));
      const isAngry = angerKeywords.some(keyword => lowerText.includes(keyword));
      const isSad = sadKeywords.some(keyword => lowerText.includes(keyword));
      const isDisconnected = disconnectedKeywords.some(keyword => lowerText.includes(keyword));
      const isSpiraling = spiralKeywords.some(keyword => lowerText.includes(keyword));

      let assistantContent = data.message;
      let suggestedActions: any[] = [];

      if (isOverwhelmed && !darkMode && !showBreathingOrb) {
        assistantContent = `${data.message}\n\nI notice your system is overwhelmed. Would any of these help right now?`;
        suggestedActions = [
          { type: 'calm', text: 'Dim the lights & breathe', icon: 'moon' },
          { type: 'pause', text: 'Pause & take 3 breaths', icon: 'pause' }
        ];
      } else if (isAngry) {
        assistantContent = `${data.message}\n\nI hear that anger. Would it help to:`;
        suggestedActions = [
          { type: 'discharge', text: 'Discharge this energy', icon: 'heart' },
          { type: 'name', text: 'Name what\'s fueling this', icon: 'message' }
        ];
      } else if (isSad) {
        assistantContent = `${data.message}\n\nI'm here with that sadness. Would you like to:`;
        suggestedActions = [
          { type: 'feel', text: 'Let yourself feel it', icon: 'heart' },
          { type: 'support', text: 'Talk about what hurts', icon: 'message' }
        ];
      } else if (isDisconnected) {
        assistantContent = `${data.message}\n\nI notice you feel disconnected. Want to try:`;
        suggestedActions = [
          { type: 'ground', text: 'Ground back into your body', icon: 'wind' },
          { type: 'senses', text: 'Connect through your senses', icon: 'eye' }
        ];
      } else if (isSpiraling) {
        assistantContent = `${data.message}\n\nI hear those racing thoughts. Let's try:`;
        suggestedActions = [
          { type: 'pause', text: 'Stop & take 3 breaths', icon: 'pause' },
          { type: 'redirect', text: 'Redirect to your body', icon: 'compass' }
        ];
      }

      const assistantMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        ...(data.audioUrl && { audioUrl: data.audioUrl }),
        ...(suggestedActions.length > 0 && { suggestedActions })
      };

      setMessages(prev => [...prev, assistantMessage]);
      trackEvent.messageSent(userTier);

      if (audioEnabled && data.audioUrl) {
        playAudio(data.audioUrl);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please ensure LM Studio is running and try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      regulate: "I need help regulating right now. My nervous system feels overwhelmed.",
      decode: "Help me decode what's happening in my body. I'm feeling sensations but don't understand them.",
      ground: "I feel disconnected and need grounding. Help me come back to my body.",
      pause: "I need to stop and take a breath. Can you guide me?",
      discharge: "I have a lot of angry energy I need to discharge safely.",
      name: "Help me understand what's really fueling this anger.",
      feel: "I want to let myself feel this sadness without judgment.",
      support: "I need to talk about what's hurting right now.",
      senses: "Help me reconnect through my five senses.",
      redirect: "My thoughts are racing. Help me redirect to my body."
    };
    handleSendMessage(quickMessages[action as keyof typeof quickMessages]);
  };

  const handleSuggestedAction = (action: string) => {
    if (action === 'calm') {
      activateCalmMode();
    } else {
      handleQuickAction(action);
    }
  };

  const activateCalmMode = () => {
    setDarkMode(true);
    setShowBreathingOrb(true);
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
      handleSendMessage();
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
      pause: Pause,
      heart: Heart,
      message: MessageCircle,
      wind: Wind,
      eye: Eye,
      compass: Compass
    };
    const Icon = icons[iconName] || Heart;
    return <Icon size={16} />;
  };

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
              <div className="vera-orbital-ring vera-ring1"></div>
              <div className="vera-orbital-ring vera-ring2"></div>
              <div className="vera-orbital-ring vera-ring3"></div>
            </div>

            {/* Breathing instruction */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
              <p className={`text-sm font-medium ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}
                 style={{ animation: 'breatheText 12s ease-in-out infinite' }}>
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
            <div>
              <h1 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 ${darkMode ? 'opacity-90' : ''}`} style={{ animation: 'textBreathe 4s ease-in-out infinite' }}>
              VERA
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
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

      {/* Crisis Resources Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl border max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl ${
            darkMode 
              ? 'bg-slate-900 border-purple-500/30' 
              : 'bg-white border-rose-200/50'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-rose-900/30' : 'bg-rose-100'
                  }`}>
                    <AlertCircle className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      Crisis Support Resources
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-slate-500'}`}>
                      Immediate help is available 24/7
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCrisisModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <X className={darkMode ? 'text-slate-400' : 'text-slate-400'} size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`border rounded-2xl p-4 ${
                  darkMode 
                    ? 'bg-rose-900/20 border-rose-500/30' 
                    : 'bg-rose-50 border-rose-200/50'
                }`}>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-rose-100' : 'text-slate-700'}`}>
                    <strong>If you're in immediate danger or having thoughts of harming yourself:</strong> These resources provide free, confidential support from trained professionals who care.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { flag: '🇺🇸', country: 'United States', org: 'Suicide & Crisis Lifeline', number: '988', href: 'tel:988' },
                    { flag: '🇬🇧', country: 'United Kingdom', org: 'Samaritans', number: '116 123', href: 'tel:116123' },
                    { flag: '🇨🇦', country: 'Canada', org: 'Suicide Crisis Helpline', number: '988', href: 'tel:988' },
                    { flag: '🇦🇺', country: 'Australia', org: 'Lifeline Australia', number: '13 11 14', href: 'tel:131114' }
                  ].map((resource, idx) => (
                    <div key={idx} className={`rounded-2xl p-5 border shadow-sm ${
                      darkMode 
                        ? 'bg-slate-800/50 border-slate-700' 
                        : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{resource.flag}</span>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {resource.country}
                        </h3>
                      </div>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-purple-300' : 'text-slate-600'}`}>
                        {resource.org}
                      </p>
                      <div className="space-y-2">
                        <a href={resource.href} className="block bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center shadow-sm">
                          {resource.number.includes('or Text') ? resource.number : `Call: ${resource.number}`}
                        </a>
                        <p className={`text-xs text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Available 24/7 • Free & Confidential
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className={`rounded-2xl p-5 border shadow-sm ${
                    darkMode 
                      ? 'bg-slate-800/50 border-slate-700' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🌍</span>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        International
                      </h3>
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-purple-300' : 'text-slate-600'}`}>
                      Find your local helpline
                    </p>
                    <a 
                      href="https://findahelpline.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center shadow-sm"
                    >
                      Visit FindAHelpline.com
                    </a>
                  </div>
                </div>

                <div className={`border rounded-2xl p-4 ${
                  darkMode 
                    ? 'bg-purple-900/20 border-purple-500/30' 
                    : 'bg-purple-50 border-purple-200/50'
                }`}>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-purple-100' : 'text-slate-700'}`}>
                    <strong>Remember:</strong> Your biology is brilliant, even in pain. What you're feeling is survival overload—not proof you are broken. These feelings are temporary, and help is available right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? darkMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500 text-white'
                    : darkMode
                      ? 'bg-slate-800 text-slate-100'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {/* Upgrade Prompt */}
                {message.isUpgradePrompt && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    darkMode 
                      ? 'bg-purple-900/20 border-purple-700' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      darkMode ? 'text-purple-100' : 'text-purple-900'
                    }`}>
                      Upgrade to Continue
                    </h4>
                    <p className={`text-sm mb-4 ${
                      darkMode ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      Get unlimited messages with Explorer ($19/mo) or unlock voice with Regulator ($39/mo)
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/#pricing"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                      >
                        View Plans
                      </a>
                      <button
                        onClick={() => {
                          setMessages([]);
                          window.location.reload();
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                          darkMode
                            ? 'bg-slate-800 text-slate-300 border-slate-600'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        Try Tomorrow
                      </button>
                    </div>
                  </div>
                )}
                {/* Contextual Suggestion Cards */}
                {message.suggestedActions && (
                  <div className="flex justify-start mt-3 gap-2 flex-wrap">
                    {message.suggestedActions.map((action: any, actionIdx: number) => (
                      <button
                        key={actionIdx}
                        onClick={() => handleSuggestedAction(action.type)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 ${
                          darkMode
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                        }`}
                      >
                        {getIcon(action.icon)}
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-2 ${
                  message.role === 'user' 
                    ? 'text-white/60' 
                    : darkMode ? 'text-purple-300/60' : 'text-slate-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`px-6 py-4 rounded-2xl shadow-sm ${
                darkMode 
                  ? 'bg-slate-800/50 border border-purple-500/20' 
                  : 'bg-white border border-slate-200/50'
              }`}>
                <div className="flex items-center gap-2 text-purple-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">VERA is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`backdrop-blur-xl border-t px-4 py-4 shadow-lg transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-900/80 border-purple-500/20' 
          : 'bg-white/80 border-rose-200/30'
      }`}>
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleQuickAction('regulate')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                darkMode
                  ? 'bg-gradient-to-r from-rose-900/50 to-pink-900/50 hover:from-rose-900/70 hover:to-pink-900/70 text-rose-200 border-rose-500/30'
                  : 'bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-rose-700 border-rose-200/50'
              }`}>
              <Heart size={16} />
              Regulate Now
            </button>
            <button
              onClick={() => handleQuickAction('decode')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                darkMode
                  ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 hover:from-purple-900/70 hover:to-blue-900/70 text-purple-200 border-purple-500/30'
                  : 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 border-purple-200/50'
              }`}>
              <Compass size={16} />
              Decode My Pattern
            </button>
            <button
              onClick={() => handleQuickAction('ground')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 hover:from-blue-900/70 hover:to-cyan-900/70 text-blue-200 border-blue-500/30'
                  : 'bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 border-blue-200/50'
              }`}>
              <Wind size={16} />
              Ground Me
            </button>
          </div>

          {/* Input Row */}
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's happening in your body..."
              className={`flex-1 border rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none shadow-sm transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300/50 text-slate-800'
              }`}
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center gap-2 font-medium shadow-md"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Send
                </>
              )}
            </button>
          </div>
          
          {/* Voice Toggle & Info */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (!voiceAvailable) {
                  alert('Voice responses available with Regulator ($39/mo) and Integrator ($79/mo) plans only. Upgrade to unlock!');
                  return;
                }
                setAudioEnabled(!audioEnabled);
              }}
              disabled={!voiceAvailable}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-sm ${
                !voiceAvailable
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300'
                  : audioEnabled 
                    ? darkMode
                      ? 'bg-purple-900/50 text-purple-200 border-purple-500/30'
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                    : darkMode
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">
                {!voiceAvailable ? 'Voice (Upgrade)' : audioEnabled ? 'Voice On' : 'Voice Off'}
              </span>
            </button>
            <p className={`text-xs ${darkMode ? 'text-purple-300/60' : 'text-slate-400'}`}>
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      {/* Legal Footer */}
      <div className={`border-t px-4 py-3 transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <div className={`flex items-center gap-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>© 2025 VERA AI. All rights reserved.</span>
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className={`flex items-center gap-1 hover:underline ${
                darkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              <Shield size={14} />
              Medical Disclaimer
            </button>
          </div>
          <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
            Not a substitute for professional care
          </span>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl border max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl ${
            darkMode 
              ? 'bg-slate-900 border-purple-500/30' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                  }`}>
                    <AlertTriangle className={darkMode ? 'text-amber-400' : 'text-amber-600'} size={28} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Important Legal Disclaimer
                    </h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Please read carefully before using VERA
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDisclaimerModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <X className={darkMode ? 'text-slate-400' : 'text-slate-500'} size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className={darkMode ? 'text-red-400' : 'text-red-600'} size={20} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
                      Medical & Mental Health Disclaimer
                    </h3>
                  </div>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-red-100' : 'text-red-900'
                  }`}>
                    <p>
                      <strong>VERA IS NOT A MEDICAL DEVICE, THERAPIST, COUNSELOR, OR HEALTHCARE PROVIDER.</strong> VERA is an educational tool designed to provide information about nervous system awareness and self-regulation techniques based on Eva Leka's personal methodology.
                    </p>
                    <p><strong>VERA DOES NOT:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Diagnose, treat, cure, or prevent any medical or mental health condition</li>
                      <li>Provide medical, psychiatric, or psychological advice</li>
                      <li>Replace professional mental health care, therapy, or medical treatment</li>
                      <li>Prescribe medication or recommend stopping prescribed medications</li>
                    </ul>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-purple-900/20 border-purple-500/30' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    Always Consult Qualified Healthcare Professionals
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-purple-100' : 'text-purple-900'
                  }`}>
                    <p>You must consult with qualified healthcare professionals before making any decisions about your mental or physical health, or using information from VERA for any medical purpose.</p>
                    <p className="font-semibold">
                      If you are experiencing a mental health crisis, thoughts of self-harm, or suicidal ideation, immediately contact emergency services (911) or a crisis helpline (988 in US/Canada).
                    </p>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border-2 ${
                  darkMode 
                    ? 'bg-red-900/30 border-red-500' 
                    : 'bg-red-100 border-red-400'
                }`}>
                  <div className={`text-center space-y-3 ${darkMode ? 'text-red-100' : 'text-red-900'}`}>
                    <p className="text-lg font-bold">⚠️ IF YOU ARE IN CRISIS</p>
                    <p className="text-sm">If you are experiencing thoughts of suicide, self-harm, or are in immediate danger:</p>
                    <div className="space-y-2">
                      <p className="font-bold text-base">CALL 911 (US) or your local emergency services</p>
                      <p className="font-bold text-base">OR TEXT/CALL 988 (US/Canada Crisis Lifeline)</p>
                    </div>
                    <p className="text-sm">VERA cannot provide emergency crisis intervention. Your life matters.</p>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Copyright & Intellectual Property
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <p>© 2025 VERA AI. All rights reserved.</p>
                    <p>The VERA methodology and all associated content are proprietary and protected by copyright law. Unauthorized reproduction or commercial use is strictly prohibited.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDisclaimerModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  I Understand and Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.3);
            opacity: 1;
          }
        }
        
        @keyframes breatheText {
          0%, 100% { 
            opacity: 0.6;
          }
          50% { 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}