import React, { useState } from 'react';
import { X, User, FileText, BookOpen, CheckCircle, Paperclip, Sparkles } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import PersonalProtocol from './PersonalProtocol';
import JournalPrompts from './JournalPrompts';
import DailyCheckIn from './DailyCheckIn';
import FileAttachments from './FileAttachments';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  userId: string;
}

type TabType = 'profile' | 'protocol' | 'journal' | 'checkin' | 'files';

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, darkMode, userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'protocol', label: 'Protocol', icon: Sparkles },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'checkin', label: 'Check-In', icon: CheckCircle },
    { id: 'files', label: 'Files', icon: Paperclip },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 transform transition-transform duration-300 ${
        darkMode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950' 
          : 'bg-gradient-to-b from-white via-blue-50/20 to-purple-50/20'
      } shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${
          darkMode ? 'border-slate-700/50' : 'border-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Your Wellness Hub
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-400' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? darkMode
                        ? 'bg-purple-900/50 text-purple-200 shadow-lg border border-purple-500/30'
                        : 'bg-purple-100 text-purple-700 shadow-md border border-purple-200'
                      : darkMode
                        ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
          {activeTab === 'profile' && <ProfileSettings darkMode={darkMode} userId={userId} />}
          {activeTab === 'protocol' && <PersonalProtocol darkMode={darkMode} userId={userId} />}
          {activeTab === 'journal' && <JournalPrompts darkMode={darkMode} userId={userId} />}
          {activeTab === 'checkin' && <DailyCheckIn darkMode={darkMode} userId={userId} />}
          {activeTab === 'files' && <FileAttachments darkMode={darkMode} userId={userId} />}
        </div>
      </div>
    </>
  );
};

export default SidePanel;