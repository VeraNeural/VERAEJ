'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
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

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadPosts(selectedChannel.id);
    }
  }, [selectedChannel]);

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
        <div className="text-purple-600">Loading community...</div>
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
              onClick={() => router.push('/chat')}
              className="text-purple-600 hover:text-purple-700"
            >
              ← Back to Chat
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
                    <div className="flex items-center gap-2">
                      <span>{channel.icon}</span>
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{channel.description}</p>
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
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedChannel.icon}</span>
                    <div>
                      <h2 className="text-xl font-medium text-slate-900">{selectedChannel.name}</h2>
                      <p className="text-sm text-slate-600">{selectedChannel.description}</p>
                    </div>
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
                      <p className="text-slate-500">No posts yet. Be the first to share!</p>
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
                              <span className="font-medium text-slate-900">{post.user_name}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(post.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
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
