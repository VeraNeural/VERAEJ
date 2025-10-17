'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  LayoutDashboard, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Mail, 
  Settings, 
  LogOut,
  Wrench,
  Lock,
  Bell,
  Sparkles,
  Crown,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react';

interface MainNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

export default function MainNavigation({ isOpen, onClose, currentPage }: MainNavigationProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    fetchChatSessions();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const unread = data.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchChatSessions = async () => {
    setLoadingChats(true);
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setChatSessions(chatSessions.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleLoadChat = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`);
    onClose();
  };

  const handleNewChat = () => {
    router.push('/chat');
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const navigate = (path: string) => {
    router.push(path);
    onClose();
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

  const tier = user?.subscription_tier || 'explorer';
  const isExplorer = tier === 'explorer';
  const isRegulator = ['regulator', 'integrator', 'test'].includes(tier);
  const isIntegrator = ['integrator', 'test'].includes(tier);

  const getTierBadge = () => {
    switch(tier) {
      case 'integrator': return { text: 'Integrator', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown };
      case 'regulator': return { text: 'Regulator', color: 'bg-gradient-to-r from-blue-500 to-purple-500', icon: Sparkles };
      case 'explorer': return { text: 'Explorer', color: 'bg-slate-600', icon: null };
      default: return { text: 'Free', color: 'bg-slate-500', icon: null };
    }
  };

  const tierBadge = getTierBadge();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-slate-900 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">VERA</h2>
                <p className="text-purple-300 text-xs">Neural Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white font-medium">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-0.5 rounded-full ${tierBadge.color} flex items-center gap-1`}>
                  {tierBadge.icon && <tierBadge.icon size={12} className="text-white" />}
                  <span className="text-white text-xs font-medium">{tierBadge.text}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'notifications'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <span className="font-medium">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-px bg-slate-700 my-2" />

          {/* Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'dashboard'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          {/* Chat with History */}
          <div>
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === 'chat'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={20} />
                <span className="font-medium">Chat with VERA</span>
              </div>
              {showChatHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Chat History */}
            {showChatHistory && (
              <div className="ml-4 mt-1 space-y-1">
                {/* New Chat Button */}
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-purple-300 hover:bg-slate-800 transition-all"
                >
                  <Plus size={16} />
                  <span>New Chat</span>
                </button>

                {/* Recent Chats */}
                {loadingChats ? (
                  <div className="px-4 py-2 text-xs text-slate-500">Loading...</div>
                ) : chatSessions.length === 0 ? (
                  <div className="px-4 py-2 text-xs text-slate-500">No chats yet</div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {chatSessions.slice(0, 10).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleLoadChat(session.id)}
                        className="group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{session.title}</p>
                          <p className="text-xs text-slate-500">{formatDate(session.updated_at)}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/50 text-red-400 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tools */}
          <button
            onClick={() => navigate('/tools')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'tools'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wrench size={20} />
            <span className="font-medium">Tools</span>
          </button>

          <div className="h-px bg-slate-700 my-2" />

          {/* REGULATOR+ FEATURES */}
          
          {/* Courses */}
          <button
            onClick={() => isRegulator ? navigate('/courses') : null}
            disabled={!isRegulator}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              !isRegulator
                ? 'text-slate-500 cursor-not-allowed'
                : currentPage === 'courses'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={20} />
              <span className="font-medium">Courses</span>
            </div>
            {!isRegulator && <Lock size={16} className="text-slate-600" />}
          </button>

          {/* Community */}
          <button
            onClick={() => isRegulator ? navigate('/community') : null}
            disabled={!isRegulator}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              !isRegulator
                ? 'text-slate-500 cursor-not-allowed'
                : currentPage === 'community'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span className="font-medium">Community</span>
            </div>
            {!isRegulator && <Lock size={16} className="text-slate-600" />}
          </button>

          {/* Messages */}
          <button
            onClick={() => isRegulator ? navigate('/messages') : null}
            disabled={!isRegulator}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              !isRegulator
                ? 'text-slate-500 cursor-not-allowed'
                : currentPage === 'messages'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail size={20} />
              <span className="font-medium">Messages</span>
            </div>
            {!isRegulator && <Lock size={16} className="text-slate-600" />}
          </button>

          {/* UPGRADE PROMPTS */}
          
          {/* Explorer → Regulator */}
          {isExplorer && (
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 mt-2 border border-blue-500/20">
              <p className="text-blue-300 text-sm font-medium mb-1 flex items-center gap-1">
                <Sparkles size={14} />
                Unlock Regulator
              </p>
              <p className="text-slate-400 text-xs mb-2">
                Get Courses, Community, Voice (20/day) & more
              </p>
              <button
                onClick={() => window.location.href = 'https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s'}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm py-2 rounded-lg transition-all font-medium"
              >
                Upgrade to Regulator - $39/mo
              </button>
            </div>
          )}

          {/* Regulator → Integrator */}
          {isRegulator && !isIntegrator && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 mt-2 border border-purple-500/20">
              <p className="text-purple-300 text-sm font-medium mb-1 flex items-center gap-1">
                <Crown size={14} />
                Unlock Integrator
              </p>
              <p className="text-slate-400 text-xs mb-2">
                Unlimited Voice, Custom Courses, Body Decoding & White Label
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm py-2 rounded-lg transition-all font-medium"
              >
                Upgrade to Integrator - $99/mo
              </button>
            </div>
          )}

          {/* Integrator Badge */}
          {isIntegrator && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 mt-2 border border-purple-500/20">
              <p className="text-purple-300 text-sm font-medium flex items-center gap-2">
                <Crown size={16} className="text-yellow-400" />
                Integrator Active
              </p>
              <p className="text-slate-400 text-xs mt-1">
                You have full access to everything
              </p>
            </div>
          )}

          <div className="h-px bg-slate-700 my-2" />

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === 'settings'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-400 hover:bg-red-900/20"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </nav>
      </div>
    </>
  );
}
