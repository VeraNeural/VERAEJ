'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Trash2, Plus, ArrowLeft, Calendar, MessageSquare, Loader2, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadSessions();
  }, []);

  const checkAuthAndLoadSessions = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        router.push('/auth/signin');
        return;
      }

      const authData = await authResponse.json();
      setUser(authData.user);

      // Load sessions
      const sessionsResponse = await fetch('/api/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      router.push('/auth/signin');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
      return;
    }

    setDeleting(sessionId);
    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      } else {
        alert('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-rose-200/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Chat</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.subscription_status} Plan</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Chat History</h1>
          <p className="text-slate-600">Review and continue your conversations with VERA</p>
        </div>

        {/* New Chat Button */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-md mb-8"
        >
          <Plus size={20} />
          Start New Chat
        </Link>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="text-purple-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No chats yet</h2>
            <p className="text-slate-600 mb-6">Start your first conversation with VERA</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-md"
            >
              <Plus size={20} />
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <MessageSquare className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar size={12} />
                        {formatDate(session.updated_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deleting === session.id}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                    title="Delete chat"
                  >
                    {deleting === session.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {session.last_message && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {session.last_message}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{session.message_count || 0} messages</span>
                  <Link
                    href={`/chat?session=${session.id}`}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}