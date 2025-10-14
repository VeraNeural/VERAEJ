'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function SidePanel({ isOpen, onClose, darkMode }: SidePanelProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`fixed inset-y-0 left-0 w-80 z-50 shadow-2xl transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-slate-900 text-white border-r border-slate-800' 
          : 'bg-white text-slate-900 border-r border-slate-200'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Neural orb */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse opacity-30" />
                </div>
                <h2 className="text-xl font-normal">VERA</h2>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6 space-y-2">
            <Link 
              href="/chat"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Chat
            </Link>
            
            <Link 
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Dashboard
            </Link>
            
            <Link 
              href="/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Settings
            </Link>

            <Link 
              href="/pricing"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              Upgrade
            </Link>
          </nav>

          {/* Footer Actions */}
          <div className={`p-6 border-t ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
