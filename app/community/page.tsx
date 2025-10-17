'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, MessageCircle, Send } from 'lucide-react';
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

interface Comment {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
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
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  
  // Comments state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

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
  }, [
