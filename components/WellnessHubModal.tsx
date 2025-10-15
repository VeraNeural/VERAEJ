'use client';

import { useState } from 'react';
import { X, User, Sparkles, BookOpen, CheckSquare, FileText } from 'lucide-react';
import PersonalProtocol from './chat/PersonalProtocol';
import JournalPrompts from './chat/JournalPrompts';
import DailyCheckin from './chat/DailyCheckin';
import UserProfile from './chat/UserProfile';

interface WellnessHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  userId: string;
}

type Tab = 'profile' | 'protocol' | 'journal' | 'checkin' | 'files';

export default function WellnessHubModal({ isOpen, onClose, darkMode, userId }: WellnessHubModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

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
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Your Wellness Hub
            </h2>
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <UserProfile darkMode={darkMode} userId={userId} />
            )}
            
            {activeTab === 'protocol' && (
              <PersonalProtocol darkMode={darkMode} userId={userId} />
            )}
            
            {activeTab === 'journal' && (
              <JournalPrompts darkMode={darkMode} userId={userId} onSelectPrompt={() => {}} />
            )}
            
            {activeTab === 'checkin' && (
              <DailyCheckin darkMode={darkMode} userId={userId} />
            )}
            
            {activeTab === 'files' && (
              <div className={`text-center py-12 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Files feature coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
