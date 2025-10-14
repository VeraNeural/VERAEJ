'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Calendar, Mail, Search, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    last24h: 0,
    last7days: 0,
    last30days: 0,
    trialUsers: 0,
    paidUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
        calculateStats(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: any[]) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    setStats({
      totalUsers: userList.length,
      last24h: userList.filter(u => new Date(u.created_at) > last24h).length,
      last7days: userList.filter(u => new Date(u.created_at) > last7days).length,
      last30days: userList.filter(u => new Date(u.created_at) > last30days).length,
      trialUsers: userList.filter(u => u.subscription_status === 'trial').length,
      paidUsers: userList.filter(u => ['explorer', 'regulator', 'integrator'].includes(u.subscription_status)).length
    });
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Subscription', 'Signed Up', 'Trial Ends'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.subscription_status,
      new Date(user.created_at).toLocaleDateString(),
      user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString() : 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vera-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getSubscriptionBadge = (status: string) => {
    const badges: any = {
      trial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
      explorer: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Explorer' },
      regulator: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Regulator' },
      integrator: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Integrator' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' }
    };
    const badge = badges[status] || badges.trial;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-rose-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">
                VERA Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">User analytics and lead management</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-slate-500">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.last24h}</h3>
            <p className="text-sm text-slate-500">Last 24 Hours</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.last7days}</h3>
            <p className="text-sm text-slate-500">Last 7 Days</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.paidUsers}</h3>
            <p className="text-sm text-slate-500">Paid Users</p>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200/50">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Trial Users</h4>
            <p className="text-3xl font-bold text-blue-700">{stats.trialUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Paid Subscribers</h4>
            <p className="text-3xl font-bold text-purple-700">{stats.paidUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
            <h4 className="text-sm font-medium text-green-900 mb-2">Conversion Rate</h4>
            <p className="text-3xl font-bold text-green-700">
              {stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">All Users</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Signed Up
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trial Ends
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={16} className="text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getSubscriptionBadge(user.subscription_status)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {user.trial_ends_at 
                          ? new Date(user.trial_ends_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}