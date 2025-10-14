import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Mail, CheckCircle } from 'lucide-react';

interface ProfileSettingsProps {
  darkMode: boolean;
  userId: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ darkMode, userId }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    timezone: 'America/New_York',
    notifications: true,
    emailUpdates: false,
    privacyMode: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.user.name || '',
            email: data.user.email || '',
            timezone: data.user.timezone || 'America/New_York',
            notifications: data.user.notifications ?? true,
            emailUpdates: data.user.emailUpdates ?? false,
            privacyMode: data.user.privacyMode ?? false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className={`p-6 rounded-2xl border ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          Profile Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-slate-900/50 border-slate-700 text-white focus:border-purple-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-purple-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-slate-900/50 border-slate-700 text-white focus:border-purple-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-purple-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Timezone
            </label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-slate-900/50 border-slate-700 text-white focus:border-purple-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-purple-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className={`p-6 rounded-2xl border ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          Preferences
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Push Notifications
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.notifications}
              onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
              className="w-5 h-5 rounded accent-purple-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Email Updates
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.emailUpdates}
              onChange={(e) => setProfile({ ...profile, emailUpdates: e.target.checked })}
              className="w-5 h-5 rounded accent-purple-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Privacy Mode
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.privacyMode}
              onChange={(e) => setProfile({ ...profile, privacyMode: e.target.checked })}
              className="w-5 h-5 rounded accent-purple-600"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
          saved
            ? 'bg-green-600 text-white'
            : darkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : saved ? (
          <>
            <CheckCircle size={20} />
            Saved!
          </>
        ) : (
          <>
            <Save size={20} />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
};

export default ProfileSettings;