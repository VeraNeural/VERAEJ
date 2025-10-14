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
  const [showUpgrade, setShowUpgrade] = useState(false);

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
