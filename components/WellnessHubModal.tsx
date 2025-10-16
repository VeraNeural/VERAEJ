'use client';

import { useState, useEffect } from 'react';
import { X, User, Sparkles, BookOpen, CheckSquare, FileText, ExternalLink, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import PersonalProtocol from './chat/PersonalProtocol';
import JournalPrompts from './chat/JournalPrompts';
import DailyCheckIn from './chat/DailyCheckIn';
import FileAttachments from './chat/FileAttachments';
import ProfileSettings from './chat/ProfileSettings';

interface WellnessHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  userId: string;
}

type Tab = 'profile' | 'protocol' | 'journal' | 'checkin' | 'files' | 'dashboard';

export default function WellnessHubModal({ isOpen, onClose, darkMode, userId }: WellnessHubModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('protocol');
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    // Fetch user tier from localStorage or API
    const fetchUserTier = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const tier = data.user?.subscription_tier || 'free';
          setUserTier(tier);
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error);
      }
    };
    
    if (isOpen) {
      fetchUserTier();
    }
  }, [isOpen]);

  // Define what each tier can access
  const hasProtocolEdit = ['regulator', 'integrator', 'test'].includes(userTier);
  const hasDashboard = ['regulator', 'integrator', 'test'].includes(userTier);
  const hasFiles = ['integrator', 'test'].includes(userTier); // Only Integrator tier

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed inset-4 md:inset-10 z-50 rounded-3xl shadow-2xl overflow-hidden ${
        darkMode 
          ? 'bg-slate-900 border border-slate-800' 
          : 'bg-white border border-slate-200'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Your Wellness Hub
              </h2>
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {userTier === 'free' && 'Free Tier'}
                {userTier === 'explorer' && 'Explorer Plan'}
                {userTier === 'regulator' && 'Regulator Plan'}
                {userTier === 'integrator' && 'Integrator Plan'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex gap-2 px-6 py-3 border-b overflow-x-auto ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? darkMode
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User size={18} />
              Profile
            </button>

            <button
              onClick={() => setActiveTab('protocol')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'protocol'
                  ? darkMode
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={18} />
              Protocol
              {!hasProtocolEdit && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  View Only
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'journal'
                  ? darkMode
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen size={18} />
              Journal
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'checkin'
                  ? darkMode
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckSquare size={18} />
              Check-In
            </button>

            {/* Dashboard - Only for Regulator and above */}
            {hasDashboard && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? darkMode
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                    : darkMode
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>
            )}

            {/* Files - Only for Integrator */}
            {hasFiles && (
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'files'
                    ? darkMode
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                    : darkMode
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText size={18} />
                Files
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <ProfileSettings darkMode={darkMode} userId={userId} />
            )}
            
            {activeTab === 'protocol' && (
              <div>
                {/* View Full Protocol Button */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      Your personalized wellness protocol
                    </p>
                    {!hasProtocolEdit && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Upgrade to Regulator to create and track your own protocols
                      </p>
                    )}
                  </div>
                  <Link
                    href="/protocol"
                    onClick={onClose}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      darkMode
                        ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                    }`}
                  >
                    View Full Protocol
                    <ExternalLink size={16} />
                  </Link>
                </div>
                <PersonalProtocol 
                  darkMode={darkMode} 
                  userId={userId}
                  readOnly={!hasProtocolEdit}
                />
              </div>
            )}
            
            {activeTab === 'journal' && (
              <JournalPrompts darkMode={darkMode} userId={userId} onSelectPrompt={() => {}} />
            )}
            
            {activeTab === 'checkin' && (
              <DailyCheckIn darkMode={darkMode} userId={userId} />
            )}

            {activeTab === 'dashboard' && hasDashboard && (
              <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Dashboard Coming Soon</h3>
                <p>Your wellness analytics and insights will appear here</p>
              </div>
            )}
            
            {activeTab === 'files' && hasFiles && (
              <FileAttachments darkMode={darkMode} userId={userId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
