'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }

  async function loadConversations() {
    try {
      const res = await fetch('/api/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        markAsRead(conversationId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async function markAsRead(conversationId: string) {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
      // Refresh conversations to update unread count
      loadConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        loadMessages(selectedConversation);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/community')}
              className="text-purple-600 hover:text-purple-700"
            >
              Back to Community
            </button>
            <h1 className="text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              Messages
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="col-span-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 h-full overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-medium text-slate-900">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation from the Community</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {conversations.map((conv) => (
                      <button
                        key={conv.conversation_id}
                        onClick={() => setSelectedConversation(conv.conversation_id)}
                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                          selectedConversation === conv.conversation_id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-slate-900 truncate">
                                {conv.other_user_name}
                              </p>
                              {conv.unread_count > 0 && (
                                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 truncate">{conv.last_message}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(conv.last_message_time)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="col-span-8">
            {selectedConversation ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            isOwn
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {msg.sender_name}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-purple-200' : 'text-slate-500'
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 h-full flex items-center justify-center">
                <p className="text-slate-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
