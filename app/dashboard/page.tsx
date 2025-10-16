'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LogOut, TrendingUp, TrendingDown, Minus, Calendar, BookOpen, CheckSquare, Zap, Brain, Heart, Moon } from 'lucide-react';

interface DashboardData {
  checkIns: {
    streak: number;
    totalCheckins: number;
    recentCheckins: Array<{
      date: string;
      mood: number;
      energy: number;
      stress: number;
      sleep: number;
    }>;
  };
  journal: {
    totalEntries: number;
    entriesThisWeek: number;
  };
  protocol: {
    totalItems: number;
    completedItems: number;
    completionRate: number;
  };
  insights: {
    moodTrend: 'up' | 'down' | 'stable';
    energyTrend: 'up' | 'down' | 'stable';
    avgMood: number;
    avgEnergy: number;
    avgStress: number;
    avgSleep: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    checkAuthAndLoadData();
  }, [timeRange]);

  const checkAuthAndLoadData = async () => {
    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        router.push('/auth/signin');
        return;
      }

      const authData = await authResponse.json();
      setUser(authData.user);

      // Check if user has access to dashboard (Regulator tier or above)
      const tier = authData.user.subscription_tier;
      if (!['regulator', 'integrator', 'test'].includes(tier)) {
        alert('Dashboard is available with Regulator plan ($39/month)\n\nUpgrade at veraneural.com/pricing');
        router.push('/chat');
        return;
      }

      // Load dashboard data
      const dashboardResponse = await fetch(`/api/dashboard/${authData.user.id}?range=${timeRange}`);
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setData(dashboardData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      router.push('/auth/signin');
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-slate-500" />;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: 'up' | 'down' | 'stable';
    color: string;
  }) => (
    <div className="p-5 rounded-xl border bg-slate-700/50 border-slate-600/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={22} />
        </div>
        {trend && getTrendIcon(trend)}
      </div>
      <p className="text-xs text-slate-300 mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading your wellness analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Chat</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.subscription_tier} Plan</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Wellness Analytics</h1>
            <p className="text-slate-300">Track your progress and insights over time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {!data ? (
          <div className="text-center py-20">
            <p className="text-slate-300 mb-6">No data available yet. Start using VERA to see your insights!</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Avg Mood"
                value={`${data.insights.avgMood.toFixed(1)}/10`}
                icon={Heart}
                trend={data.insights.moodTrend}
                color="bg-rose-900/50 text-rose-400"
              />
              <StatCard
                title="Avg Energy"
                value={`${data.insights.avgEnergy.toFixed(1)}/10`}
                icon={Zap}
                trend={data.insights.energyTrend}
                color="bg-yellow-900/50 text-yellow-400"
              />
              <StatCard
                title="Avg Stress"
                value={`${data.insights.avgStress.toFixed(1)}/10`}
                icon={Brain}
                color="bg-purple-900/50 text-purple-400"
              />
              <StatCard
                title="Avg Sleep"
                value={`${data.insights.avgSleep.toFixed(1)}h`}
                icon={Moon}
                color="bg-blue-900/50 text-blue-400"
              />
            </div>

            {/* Activity Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Check-in Streak */}
              <div className="p-6 rounded-xl border bg-slate-700/50 border-slate-600/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={22} className="text-orange-400" />
                  <span className="font-semibold text-white">Check-in Streak</span>
                </div>
                <div className="text-4xl font-bold text-orange-400 mb-2">
                  {data.checkIns.streak} days 🔥
                </div>
                <p className="text-sm text-slate-300">
                  {data.checkIns.totalCheckins} total check-ins
                </p>
              </div>

              {/* Journal Activity */}
              <div className="p-6 rounded-xl border bg-slate-700/50 border-slate-600/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={22} className="text-purple-400" />
                  <span className="font-semibold text-white">Journal Entries</span>
                </div>
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {data.journal.entriesThisWeek}
                </div>
                <p className="text-sm text-slate-300">
                  {data.journal.totalEntries} total entries
                </p>
              </div>

              {/* Protocol Completion */}
              <div className="p-6 rounded-xl border bg-slate-700/50 border-slate-600/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckSquare size={22} className="text-green-400" />
                  <span className="font-semibold text-white">Protocol Progress</span>
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {data.protocol.completionRate}%
                </div>
                <p className="text-sm text-slate-300">
                  {data.protocol.completedItems} of {data.protocol.totalItems} completed
                </p>
              </div>
            </div>

            {/* Recent Trends */}
            {data.checkIns.recentCheckins.length > 0 && (
              <div className="p-6 rounded-xl border bg-slate-700/50 border-slate-600/50 shadow-lg backdrop-blur-sm">
                <h4 className="font-semibold text-white mb-6">Recent Mood & Energy Trends</h4>
                <div className="space-y-4">
                  {data.checkIns.recentCheckins.slice(0, 7).reverse().map((checkin, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">
                          {new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex gap-6 text-sm">
                          <span className="text-rose-400">Mood: {checkin.mood}</span>
                          <span className="text-yellow-400">Energy: {checkin.energy}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                            style={{ width: `${(checkin.mood / 10) * 100}%` }}
                          />
                        </div>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
                            style={{ width: `${(checkin.energy / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="p-6 rounded-xl border bg-purple-900/30 border-purple-700/50 shadow-lg backdrop-blur-sm">
              <h4 className="font-semibold text-purple-300 mb-4">💡 VERA's Insights</h4>
              <div className="space-y-3">
                {data.insights.moodTrend === 'up' && (
                  <p className="text-sm text-purple-200">
                    ✨ Your mood has been improving over the past {timeRange === '7d' ? '7 days' : '30 days'}. Keep up the good work!
                  </p>
                )}
                {data.insights.energyTrend === 'down' && (
                  <p className="text-sm text-purple-200">
                    💤 Your energy levels have been lower lately. Consider reviewing your sleep and protocol routines.
                  </p>
                )}
                {data.checkIns.streak >= 7 && (
                  <p className="text-sm text-purple-200">
                    🔥 Amazing! You've maintained a {data.checkIns.streak}-day check-in streak. Consistency is key to nervous system regulation.
                  </p>
                )}
                {data.protocol.completionRate < 50 && data.protocol.totalItems > 0 && (
                  <p className="text-sm text-purple-200">
                    📋 You have protocol items waiting. Completing them can help establish beneficial routines.
                  </p>
                )}
                {!data.insights.moodTrend && !data.insights.energyTrend && data.checkIns.streak < 7 && data.protocol.completionRate >= 50 && (
                  <p className="text-sm text-purple-200">
                    👋 Start tracking your daily check-ins to see personalized insights and trends!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
