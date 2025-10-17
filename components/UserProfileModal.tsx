'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, FileText } from 'lucide-react';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onMessage?: (userId: string, userName: string) => void;
}

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
    tier: string;
  };
  stats: {
    posts: number;
    comments: number;
  };
  recentPosts: Array<{
    id: string;
    content: string;
    created_at: string;
    post_type: string;
  }>;
}

export default function UserProfileModal({ userId, isOpen, onClose, onMessage }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-purple-600">Loading profile...</div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-medium flex-shrink-0">
                    {profile.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-slate-900 mb-1">
                      {profile.user.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Calendar size={14} />
                      <span>Joined {new Date(profile.user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    {profile.user.tier && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {profile.user.tier.charAt(0).toUpperCase() + profile.user.tier.slice(1)} Member
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Button */}
                {onMessage && (
                  <button
                    onClick={() => {
                      onMessage(profile.user.id, profile.user.name);
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all"
                  >
                    Send Message
                  </button>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <FileText size={16} className="text-purple-600" />
                      <span className="text-2xl font-bold text-slate-900">{profile.stats.posts}</span>
                    </div>
                    <p className="text-sm text-slate-600">Posts</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MessageSquare size={16} className="text-purple-600" />
                      <span className="text-2xl font-bold text-slate-900">{profile.stats.comments}</span>
                    </div>
                    <p className="text-sm text-slate-600">Comments</p>
                  </div>
                </div>

                {/* Recent Posts */}
                {profile.recentPosts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Recent Posts</h4>
                    <div className="space-y-3">
                      {profile.recentPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <p className="text-sm text-slate-700 line-clamp-3 mb-2">
                            {post.content}
                          </p>
                          <span className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Profile not found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
