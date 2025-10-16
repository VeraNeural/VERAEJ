'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  created_at: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (selectedChannel && hasAccess) {
      loadPosts(selectedChannel.id);
    }
  }, [selectedChannel, hasAccess]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  // No access - show upgrade page
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text mb-4">
                VERA Community
              </h1>
              <p className="text-xl text-slate-700 mb-2">A sacred space for collective healing</p>
              <p className="text-slate-600">Available exclusively to Regulator tier members</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-slate-900 mb-6">What awaits you inside:</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <p className="text-slate-700">Connect with others who truly understand the nervous system journey</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <p className="text-slate-700">Share wins, ask questions, and support each other</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <p className="text-slate-700">Access exclusive resources and protocols</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <p className="text-slate-700">Direct connection with Eva and the VERA team</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="https://buy.stripe.com/YOUR_REGULATOR_LINK"
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

  // Has access - show community
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="text-purple-600 hover:text-purple-700"
            >
              Back to Chat
            </button>
            <h1 className="text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              VERA Community
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Channels Sidebar */}
          <div className="col-span-3">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4">Channels</h2>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedChannel?.id === channel.id
                        ? 'bg-purple-100 text-purple-900'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{channel.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Area */}
          <div className="col-span-9">
            {selectedChannel && (
              <div className="space-y-4">
                {/* Channel Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6">
                  <div>
                    <h2 className="text-xl font-medium text-slate-900">{selectedChannel.name}</h2>
                  </div>
                </div>

                {/* New Post Form */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6">
                  <form onSubmit={handlePostSubmit}>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share with the community..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newPost.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-12 text-center">
                      <p className="text-slate-500">No posts yet. Be the first to share</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium">
                            {post.user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
