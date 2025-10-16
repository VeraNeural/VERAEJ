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
        // Redirect to upgrade page or show message
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
    <div className="p-5 rounded-xl border bg-white border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={22} />
        </div>
        {trend && getTrendIcon(trend)}
      </div>
      <p className="text-xs text-slate-600 mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your wellness analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-rose-200/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Chat</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.subscription_tier} Plan</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Wellness Analytics</h1>
            <p className="text-slate-600">Track your progress and insights over time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {!data ? (
          <div className="text-center py-20">
            <p className="text-slate-600 mb-6">No data available yet. Start using VERA to see your insights!</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium"
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
                color="bg-rose-100 text-rose-600"
              />
              <StatCard
                title="Avg Energy"
                value={`${data.insights.avgEnergy.toFixed(1)}/10`}
                icon={Zap}
                trend={data.insights.energyTrend}
                color="bg-yellow-100 text-yellow-600"
              />
              <StatCard
                title="Avg Stress"
                value={`${data.insights.avgStress.toFixed(1)}/10`}
                icon={Brain}
                color="bg-purple-100 text-purple-600"
              />
              <StatCard
                title="Avg Sleep"
                value={`${data.insights.avgSleep.toFixed(1)}h`}
                icon={Moon}
                color="bg-blue-100 text-blue-600"
              />
            </div>

            {/* Activity Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Check-in Streak */}
              <div className="p-6 rounded-xl border bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={22} className="text-orange-600" />
                  <span className="font-semibold text-slate-900">Check-in Streak</span>
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {data.checkIns.streak} days 🔥
                </div>
                <p className="text-sm text-slate-600">
                  {data.checkIns.totalCheckins} total check-ins
                </p>
              </div>

              {/* Journal Activity */}
              <div className="p-6 rounded-xl border bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={22} className="text-purple-600" />
                  <span className="font-semibold text-slate-900">Journal Entries</span>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {data.journal.entriesThisWeek}
                </div>
                <p className="text-sm text-slate-600">
                  {data.journal.totalEntries} total entries
                </p>
              </div>

              {/* Protocol Completion */}
              <div className="p-6 rounded-xl border bg-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckSquare size={22} className="text-green-600" />
                  <span className="font-semibold text-slate-900">Protocol Progress</span>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {data.protocol.completionRate}%
                </div>
                <p className="text-sm text-slate-600">
                  {data.protocol.completedItems} of {data.protocol.totalItems} completed
                </p>
              </div>
            </div>

            {/* Recent Trends */}
            {data.checkIns.recentCheckins.length > 0 && (
              <div className="p-6 rounded-xl border bg-white border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-6">Recent Mood & Energy Trends</h4>
                <div className="space-y-4">
                  {data.checkIns.recentCheckins.slice(0, 7).reverse().map((checkin, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">
                          {new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex gap-6 text-sm">
                          <span className="text-rose-600">Mood: {checkin.mood}</span>
                          <span className="text-yellow-600">Energy: {checkin.energy}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{ width: `${(checkin.mood / 10) * 100}%` }}
                          />
                        </div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full transition-all"
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
            <div className="p-6 rounded-xl border bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-4">💡 VERA's Insights</h4>
              <div className="space-y-3">
                {data.insights.moodTrend === 'up' && (
                  <p className="text-sm text-purple-800">
                    ✨ Your mood has been improving over the past {timeRange === '7d' ? '7 days' : '30 days'}. Keep up the good work!
                  </p>
                )}
                {data.insights.energyTrend === 'down' && (
                  <p className="text-sm text-purple-800">
                    💤 Your energy levels have been lower lately. Consider reviewing your sleep and protocol routines.
                  </p>
                )}
                {data.checkIns.streak >= 7 && (
                  <p className="text-sm text-purple-800">
                    🔥 Amazing! You've maintained a {data.checkIns.streak}-day check-in streak. Consistency is key to nervous system regulation.
                  </p>
                )}
                {data.protocol.completionRate < 50 && data.protocol.totalItems > 0 && (
                  <p className="text-sm text-purple-800">
                    📋 You have protocol items waiting. Completing them can help establish beneficial routines.
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
