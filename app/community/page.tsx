'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import PollPost from '@/components/PollPost';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  required_tier: string | null;
}

interface Post {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  created_at: string;
  is_pinned?: boolean;
  post_type?: string;
  poll_id?: string;
  poll_question?: string;
  poll_options?: any;
  poll_closes_at?: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (selectedChannel && hasAccess) {
      loadPosts(selectedChannel.id);
    }
  }, [selectedChannel, hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      loadCurrentUser();
    }
  }, [hasAccess]);

  async function checkAccess() {
    try {
      const res = await fetch('/api/community/check-access');
      const data = await res.json();
      
      if (!data.hasAccess) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }
      
      setHasAccess(true);
      loadChannels();
    } catch (error) {
      console.error('Failed to check access:', error);
      setIsLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  async function loadChannels() {
    try {
      const res = await fetch('/api/community/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels);
        if (data.channels.length > 0) {
          setSelectedChannel(data.channels[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPosts(channelId: string) {
    try {
      const res = await fetch(`/api/community/posts?channelId=${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim() || !selectedChannel) return;

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          content: newPost,
        }),
      });

      if (res.ok) {
        setNewPost('');
        loadPosts(selectedChannel.id);
      }
    } catch (error) {
      console.error('Failed to post:', error);
    }
  }

  async function startConversation(recipientId: string, recipientName: string) {
    const conversationId = `${[currentUserId, recipientId].sort().join('_')}`;
    router.push(`/messages?conversation=${conversationId}&recipient=${recipientId}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8 md:p-12 text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text mb-4">
                VERA Community
              </h1>
              <p className="text-lg md:text-xl text-slate-700 mb-2">A sacred space for collective healing</p>
              <p className="text-slate-600">Available exclusively to Regulator tier members</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-xl md:text-2xl font-medium text-slate-900 mb-6">What awaits you inside:</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">Connect with others who truly understand the nervous system journey</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">Share wins, ask questions, and support each other</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">Access exclusive resources and protocols</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700">Direct connection with Eva and the VERA team</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s"
                className="block w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg"
              >
                Upgrade to Regulator - $39/month
              </Link>
              <button
                onClick={() => router.push('/chat')}
                className="block w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
              >
                Back to Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/chat')}
                className="text-purple-600 hover:text-purple-700 text-sm md:text-base"
              >
                Back
              </button>
              <h1 className="text-xl md:text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                Community
              </h1>
            </div>
            <div className="hidden md:flex gap-3">
              <Link
                href="/rituals"
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all text-sm"
              >
                Daily Ritual
              </Link>
              <Link
                href="/messages"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all text-sm"
              >
                Messages
              </Link>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden gap-2 mt-3">
            <Link
              href="/rituals"
              className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all text-sm text-center"
            >
              Ritual
            </Link>
            <Link
              href="/messages"
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all text-sm text-center"
            >
              Messages
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Mobile Channel Selector */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <button
              onClick={() => setShowChannelDropdown(!showChannelDropdown)}
              className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">
                  {selectedChannel?.name || 'Select Channel'}
                </span>
                {selectedChannel?.required_tier === 'regulator' && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    Exclusive
                  </span>
                )}
              </div>
              <ChevronDown size={20} className={`transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showChannelDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-purple-100 p-2 z-20">
                {channels.map((channel) => {
                  const isExclusive = channel.required_tier === 'regulator';
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        setShowChannelDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedChannel?.id === channel.id
                          ? 'bg-purple-100 text-purple-900'
                          : 'hover:bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{channel.name}</span>
                        {isExclusive && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            Exclusive
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Desktop Channels Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6 sticky top-24">
              <h2 className="text-lg font-medium text-slate-900 mb-4">Channels</h2>
              <div className="space-y-2">
                {channels.map((channel) => {
                  const isExclusive = channel.required_tier === 'regulator';
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedChannel?.id === channel.id
                          ? isExclusive
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 border-2 border-purple-300'
                            : 'bg-purple-100 text-purple-900'
                          : isExclusive
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-slate-700 border border-purple-200'
                            : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{channel.name}</span>
                        {isExclusive && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            Exclusive
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Posts Area */}
          <div className="lg:col-span-9">
            {selectedChannel && (
              <div className="space-y-4">
                {/* Channel Header - Desktop only */}
                <div className="hidden lg:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6">
                  <h2 className="text-xl font-medium text-slate-900">{selectedChannel.name}</h2>
                </div>

                {/* New Post Form */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-4 md:p-6">
                  <form onSubmit={handlePostSubmit}>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share with the community..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400 resize-none text-sm md:text-base"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newPost.trim()}
                        className="px-4 md:px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-8 md:p-12 text-center">
                      <p className="text-slate-500">No posts yet. Be the first to share</p>
                    </div>
                  ) : (
                    posts.map((post) => {
                      const isVera = post.user_name === 'VERA';
                      const isPinned = post.is_pinned;
                      const isPoll = post.post_type === 'poll' && post.poll_id;
                      
                      return (
                        <div
                          key={post.id}
                          className={`backdrop-blur-xl rounded-3xl shadow-lg border p-4 md:p-6 ${
                            isVera 
                              ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200' 
                              : 'bg-white/90 border-purple-100'
                          }`}
                        >
                          {isPinned && (
                            <div className="flex items-center gap-2 mb-3 text-xs text-purple-600 font-medium">
                              📌 Pinned
                            </div>
                          )}
                          <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
                              isVera 
                                ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                                : 'bg-gradient-to-r from-purple-400 to-blue-400'
                            }`}>
                              {post.user_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 min-w-0">
                                  <span className="font-medium text-slate-900 text-sm md:text-base truncate">{post.user_name}</span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(post.created_at).toLocaleString()}
                                  </span>
                                </div>
                                {post.user_id !== currentUserId && !isVera && (
                                  <button
                                    onClick={() => startConversation(post.user_id, post.user_name)}
                                    className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap flex-shrink-0"
                                  >
                                    Message
                                  </button>
                                )}
                              </div>
                              {!isPoll && (
                                <p className="text-slate-700 whitespace-pre-wrap text-sm md:text-base break-words">{post.content}</p>
                              )}
                            </div>
                          </div>

                          {/* Poll Component */}
                          {isPoll && post.poll_id && post.poll_question && post.poll_options && (
                            <PollPost
                              pollId={post.poll_id}
                              question={post.poll_question}
                              options={post.poll_options}
                              closesAt={post.poll_closes_at || null}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
