import React, { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Battery, Heart, Brain, TrendingUp } from 'lucide-react';

interface DailyCheckInProps {
  darkMode: boolean;
  userId: string;
}

interface CheckInData {
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  note: string;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ darkMode, userId }) => {
  const [checkIn, setCheckIn] = useState<CheckInData>({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 7,
    note: '',
  });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      const response = await fetch(`/api/checkin/${userId}/today`);
      if (response.ok) {
        const data = await response.json();
        if (data.checkedIn) {
          setHasCheckedIn(true);
          setCheckIn(data.data);
        }
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const submitCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/checkin/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkIn,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasCheckedIn(true);
        setStreak(data.streak || streak + 1);
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 3) return { icon: Frown, color: 'text-red-500' };
    if (value <= 7) return { icon: Meh, color: 'text-yellow-500' };
    return { icon: Smile, color: 'text-green-500' };
  };

  const SliderInput = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    min = 1, 
    max = 10,
    suffix = ''
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    icon: any;
    min?: number;
    max?: number;
    suffix?: string;
  }) => (
    <div className={`p-4 rounded-xl border ${
      darkMode 
        ? 'bg-slate-800/50 border-slate-700/50' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
          <span className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {label}
          </span>
        </div>
        <span className={`text-lg font-bold ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={hasCheckedIn}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
          darkMode 
            ? 'bg-slate-700' 
            : 'bg-slate-200'
        } accent-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          background: `linear-gradient(to right, ${darkMode ? '#9333ea' : '#7c3aed'} 0%, ${darkMode ? '#9333ea' : '#7c3aed'} ${((value - min) / (max - min)) * 100}%, ${darkMode ? '#334155' : '#e2e8f0'} ${((value - min) / (max - min)) * 100}%, ${darkMode ? '#334155' : '#e2e8f0'} 100%)`
        }}
      />
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{min}</span>
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{max}</span>
      </div>
    </div>
  );

  if (hasCheckedIn) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className={`p-6 rounded-2xl border text-center ${
          darkMode 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            darkMode ? 'bg-green-900/50' : 'bg-green-100'
          }`}>
            <Smile size={32} className={darkMode ? 'text-green-400' : 'text-green-600'} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Check-in Complete! 🎉
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-green-200' : 'text-green-800'
          }`}>
            You've checked in today. Come back tomorrow!
          </p>
        </div>

        {/* Streak */}
        <div className={`p-4 rounded-xl border ${
          darkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className={darkMode ? 'text-orange-400' : 'text-orange-600'} />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Current Streak
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {streak} {streak === 1 ? 'day' : 'days'} 🔥
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="space-y-3">
          <h4 className={`text-sm font-semibold uppercase tracking-wide ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Today's Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Mood
              </div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {checkIn.mood}/10
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Energy
              </div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {checkIn.energy}/10
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Stress
              </div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {checkIn.stress}/10
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Sleep
              </div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {checkIn.sleep}h
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Streak */}
      <div className={`p-4 rounded-xl border ${
        darkMode 
          ? 'bg-purple-900/20 border-purple-500/30' 
          : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${
            darkMode ? 'text-purple-200' : 'text-purple-800'
          }`}>
            How are you today?
          </p>
          {streak > 0 && (
            <div className={`flex items-center gap-1.5 text-sm font-bold ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              🔥 {streak} day streak
            </div>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <SliderInput
          label="Mood"
          value={checkIn.mood}
          onChange={(v) => setCheckIn({ ...checkIn, mood: v })}
          icon={Heart}
        />
        
        <SliderInput
          label="Energy"
          value={checkIn.energy}
          onChange={(v) => setCheckIn({ ...checkIn, energy: v })}
          icon={Battery}
        />
        
        <SliderInput
          label="Stress Level"
          value={checkIn.stress}
          onChange={(v) => setCheckIn({ ...checkIn, stress: v })}
          icon={Brain}
        />
        
        <SliderInput
          label="Sleep Last Night"
          value={checkIn.sleep}
          onChange={(v) => setCheckIn({ ...checkIn, sleep: v })}
          icon={Smile}
          min={0}
          max={12}
          suffix="h"
        />
      </div>

      {/* Note */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Quick Note (Optional)
        </label>
        <textarea
          value={checkIn.note}
          onChange={(e) => setCheckIn({ ...checkIn, note: e.target.value })}
          placeholder="Anything else on your mind?"
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border resize-none transition-colors ${
            darkMode
              ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-400'
          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={submitCheckIn}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
          darkMode
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        ) : (
          'Complete Check-In'
        )}
      </button>
    </div>
  );
};

export default DailyCheckIn;