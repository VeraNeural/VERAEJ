'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Check, Calendar, TrendingUp, Edit2, Trash2, BarChart3, Download } from 'lucide-react';

interface Protocol {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  completion_count: number;
  last_completed: string | null;
}

export default function ProtocolPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    title: '',
    description: '',
    category: 'mindfulness',
    frequency: 'daily'
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    fetchProtocols();
  }, [user]);

  const fetchProtocols = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/protocol/${user?.id}`);
      const data = await response.json();
      setProtocols(data.protocols || []);
    } catch (error) {
      console.error('Failed to fetch protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProtocol = async () => {
    if (!newProtocol.title.trim()) return;

    try {
      const response = await fetch(`/api/protocol/${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProtocol)
      });

      if (response.ok) {
        setNewProtocol({ title: '', description: '', category: 'mindfulness', frequency: 'daily' });
        setShowAddForm(false);
        fetchProtocols();
      }
    } catch (error) {
      console.error('Failed to add protocol:', error);
    }
  };

  const handleComplete = async (protocolId: string) => {
    try {
      const response = await fetch(`/api/protocol/${user?.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId })
      });

      if (response.ok) {
        fetchProtocols();
      }
    } catch (error) {
      console.error('Failed to complete protocol:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-gray-400">Loading your protocol...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Personal Protocol</h1>
              <p className="text-gray-400">AI-powered wellness framework tailored to you</p>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Items</p>
                <p className="text-3xl font-bold text-white">{protocols.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Check className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Completions</p>
                <p className="text-3xl font-bold text-white">
                  {protocols.reduce((sum, p) => sum + p.completion_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <BarChart3 className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-3xl font-bold text-white">0 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Protocol Items</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
          >
            <Plus size={20} />
            Add New Item
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add Protocol Item</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title (e.g., Morning meditation)"
                value={newProtocol.title}
                onChange={(e) => setNewProtocol({ ...newProtocol, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <textarea
                placeholder="Description (optional)"
                value={newProtocol.description}
                onChange={(e) => setNewProtocol({ ...newProtocol, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none transition-colors"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Frequency</label>
                  <select
                    value={newProtocol.frequency}
                    onChange={(e) => setNewProtocol({ ...newProtocol, frequency: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={newProtocol.category}
                    onChange={(e) => setNewProtocol({ ...newProtocol, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="mindfulness">Mindfulness</option>
                    <option value="exercise">Exercise</option>
                    <option value="journaling">Journaling</option>
                    <option value="somatic">Somatic Practice</option>
                    <option value="daily">Daily Routine</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddProtocol}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all"
                >
                  Add to Protocol
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Protocol Items */}
        {protocols.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <TrendingUp size={64} className="mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-bold text-white mb-2">No protocol items yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your personalized wellness protocol by adding practices that support your growth.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {protocols.map((protocol) => (
              <div
                key={protocol.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{protocol.title}</h3>
                      <span className="px-3 py-1 text-xs bg-purple-900/50 text-purple-300 rounded-full">
                        {protocol.frequency}
                      </span>
                      <span className="px-3 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-full">
                        {protocol.category}
                      </span>
                    </div>
                    {protocol.description && (
                      <p className="text-gray-400 mb-4">{protocol.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} />
                        {protocol.last_completed
                          ? `Last: ${new Date(protocol.last_completed).toLocaleDateString()}`
                          : 'Not completed yet'}
                      </span>
                      <span className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        {protocol.completion_count} completions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleComplete(protocol.id)}
                    className="ml-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30"
                    title="Mark as complete"
                  >
                    <Check size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Create this file, push to GitHub, and then you can access it at:**
```
https://www.veraneural.com/protocol
