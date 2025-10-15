import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, TrendingUp, Check, Plus } from 'lucide-react';

interface PersonalProtocolProps {
  darkMode: boolean;
  userId: string;
}

interface Protocol {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  completion_count: number;
  last_completed: string | null;
}

const PersonalProtocol: React.FC<PersonalProtocolProps> = ({ darkMode, userId }) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProtocols();
  }, [userId]);

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/protocol/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProtocols(data.protocols || []);
      }
    } catch (error) {
      console.error('Failed to fetch protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (protocolId: string) => {
    try {
      const response = await fetch(`/api/protocol/${userId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId })
      });

      if (response.ok) {
        fetchProtocols();
      }
    } catch (error) {
      console.error('Failed to complete protocol:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`w-8 h-8 border-3 rounded-full animate-spin ${
          darkMode 
            ? 'border-purple-500 border-t-transparent' 
            : 'border-purple-600 border-t-transparent'
        }`} />
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <div className={`text-center py-12 px-6 rounded-2xl border ${
        darkMode 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white border-slate-200'
      }`}>
        <Sparkles size={48} className={`mx-auto mb-4 ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        }`} />
        <h3 className={`text-xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          No Protocol Items Yet
        </h3>
        <p className={`text-sm mb-6 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Your personalized wellness protocol will appear here as VERA learns from your interactions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Your Personal Protocol
          </h3>
          <p className={`text-xs mt-1 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {protocols.length} active items
          </p>
        </div>
        <button
          onClick={fetchProtocols}
          className={`p-2.5 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Protocol Items */}
      <div className="space-y-3">
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50' 
                : 'bg-white border-slate-200 hover:border-purple-300'
            } transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    {protocol.title}
                  </h5>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    darkMode 
                      ? 'bg-purple-900/50 text-purple-300' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {protocol.frequency}
                  </span>
                </div>
                {protocol.description && (
                  <p className={`text-sm mb-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {protocol.description}
                  </p>
                )}
                <div className={`flex items-center gap-3 text-xs ${
                  darkMode ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    {protocol.completion_count} completions
                  </span>
                  {protocol.last_completed && (
                    <span>
                      Last: {new Date(protocol.last_completed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleComplete(protocol.id)}
                className={`ml-3 p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                title="Mark as complete"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalProtocol;
