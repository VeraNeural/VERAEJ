'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/signin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading VERA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ChatWindow />;
}