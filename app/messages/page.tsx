'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';

interface Conversation {
  id: string;
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
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [showConversationsList, setShowConversationsList] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    loadConversations();

    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversation(conversationId);
      setShowConversationsList(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      const interval = setInterval(() => loadMessages(selectedConversation), 3000);
      return () => clearInterval(interval);
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
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        
        if (data.messages.length > 0) {
          const otherUser = data.messages.find((m: Message) => m.sender_id !== currentUserId);
          if (otherUser) {
            setRecipientName(otherUser.sender_name);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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

  function selectConversation(conv: Conversation) {
    setSelectedConversation(conv.id);
    setRecipientName(conv.other_user_name);
    setShowConversationsList(false);
  }

  function backToConversations() {
    setShowConversationsList(true);
    setSelectedConversation(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showConversationsList && (
                <button
                  onClick={backToConversations}
                  className="lg:hidden text-purple-600 hover:text-purple-700"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <button
                onClick={() => router.push('/community')}
                className={`text-purple-600 hover:text-purple-700 text-sm md:text-base ${!showConversationsList ? 'hidden lg:block' : ''}`}
              >
                Back to Community
              </button>
              <h1 className="text-xl md:text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                {showConversationsList ? 'Messages' : recipientName || 'Messages'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Conversations List */}
          <div className={`lg:col-span-4 ${showConversationsList ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-4 md:p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4">Conversations</h2>
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-sm">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full text-left p-3 md:p-4 rounded-xl transition-all ${
                        selectedConversation === conv.id
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 text-sm md:text-base">
                          {conv.other_user_name}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 truncate">{conv.last_message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`lg:col-span-8 ${!showConversationsList ? 'block' : 'hidden lg:block'}`}>
            {selectedConversation ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 flex flex-col h-[calc(100vh-180px)] md:h-[600px]">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender_id === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl ${
                              isCurrentUser
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p className="text-sm md:text-base break-words whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-purple-100' : 'text-slate-500'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 md:py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400 text-sm md:text-base"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={18} />
                      <span className="hidden md:inline">Send</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 h-[600px] items-center justify-center">
                <p className="text-slate-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading messages...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
