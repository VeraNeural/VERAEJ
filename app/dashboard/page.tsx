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
                className="p-2 text-slate-
