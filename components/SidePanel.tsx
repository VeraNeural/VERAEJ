'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  currentSessionId?: string | null;
  onNewChat?: () => void;
  onLoadChat?: (sessionId: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  message_count?: number;
}

export default function SidePanel({ isOpen, onClose, darkMode, currentSessionId, onNewChat, onLoadChat }: SidePanelProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState<string>('explorer');

  useEffect(() => {
    if (isOpen) {
      loadSessions();
      loadUserTier();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserTier = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserTier(data.user.subscription_tier);
      }
    } catch (error) {
      console.error('Failed to load user tier:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation?')) return;

    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`fixed inset-y-0 left-0 w-80 z-50 shadow-2xl transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-slate-900 text-white border-r border-slate-800' 
          : 'bg-white text-slate-900 border-r border-slate-200'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse opacity-30" />
                </div>
                <h2 className="text-xl font-normal">VERA</h2>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                if (onNewChat) onNewChat();
                onClose();
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                darkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Plus size={18} />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Recent Chats
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className={`text-center py-8 px-4 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (onLoadChat) onLoadChat(session.id);
                      onClose();
                    }}
                    className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${
                      currentSessionId === session.id
                        ? darkMode
                          ? 'bg-purple-900/50 border border-purple-500/30'
                          : 'bg-purple-50 border border-purple-200'
                        : darkMode
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        darkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>
                        {session.title}
                      </p>
                      <p className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${
                        darkMode
                          ? 'hover:bg-red-900/50 text-red-400'
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`p-4 border-t space-y-1 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <Link 
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-300' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Dashboard
            </Link>

            {/* Community Link - Only for Regulator+ */}
            {(userTier === 'regulator' || userTier === 'integrator') && (
              <Link 
                href="/community"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Community
              </Link>
            )}

            {/* Messages Link - Only for Regulator+ */}
            {(userTier === 'regulator' || userTier === 'integrator') && (
              <Link 
                href="/messages"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Messages
              </Link>
            )}
            
            {/* Dynamic Upgrade Link Based on Tier */}
            {userTier === 'explorer' && (
              <a 
                href="https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Upgrade to Regulator
              </a>
            )}
            
            {userTier === 'regulator' && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span>Integrator Coming Q1 2026</span>
              </div>
            )}

            {userTier === 'integrator' && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                <span>Integrator Plan Active</span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-400' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}


