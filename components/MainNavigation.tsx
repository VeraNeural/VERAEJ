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
          {
