'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtocolItem {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  is_active: boolean;
  completion_count: number;
  last_completed?: string;
}

export default function ProtocolPage() {
  const [protocols, setProtocols] = useState<ProtocolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage or your auth system
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchProtocols(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProtocols = async (uid: string) => {
    try {
      const response = await fetch(`/api/protocol/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setProtocols(data);
      }
    } catch (error) {
      console.error('Error fetching protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (protocolId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/protocol/${userId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId }),
      });

      if (response.ok) {
        // Refresh protocols
        fetchProtocols(userId);
      }
    } catch (error) {
      console.error('Error completing protocol:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      mindfulness: 'from-purple-500/20 to-blue-500/20 border-purple-500/30',
      physical: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      nutrition: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
      sleep: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
      social: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    };
    return colors[category.toLowerCase()] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  const groupedProtocols = protocols.reduce((acc, protocol) => {
    if (!acc[protocol.category]) {
      acc[protocol.category] = [];
    }
    acc[protocol.category].push(protocol);
    return acc;
  }, {} as Record<string, ProtocolItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your protocol...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  Your Wellness Protocol
                </h1>
                <p className="text-white/60 mt-1">
                  Your personalized daily wellness routine
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60">Total Completions</div>
              <div className="text-2xl font-bold text-white">
                {protocols.reduce((sum, p) => sum + p.completion_count, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {protocols.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No Protocol Items Yet
            </h2>
            <p className="text-white/60 mb-6">
              Chat with VERA to create your personalized wellness protocol
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProtocols).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-white mb-4 capitalize flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category).split(' ')[0].replace('/20', '')}`} />
                  {category}
                </h2>
                <div className="grid gap-4">
                  {items.map((protocol) => (
                    <div
                      key={protocol.id}
                      className={`bg-gradient-to-r ${getCategoryColor(protocol.category)} backdrop-blur-sm rounded-xl border p-6 hover:scale-[1.01] transition-all`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {protocol.title}
                            </h3>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                              {protocol.frequency}
                            </span>
                          </div>
                          <p className="text-white/70 mb-3">
                            {protocol.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{protocol.completion_count} completions</span>
                            </div>
                            {protocol.last_completed && (
                              <div>
                                Last: {new Date(protocol.last_completed).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleComplete(protocol.id)}
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all group"
                        >
                          <CheckCircle2 className="w-6 h-6 text-white/60 group-hover:text-green-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
