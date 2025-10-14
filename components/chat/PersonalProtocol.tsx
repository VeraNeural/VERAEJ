import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, TrendingUp } from 'lucide-react';

interface PersonalProtocolProps {
  darkMode: boolean;
  userId: string;
}

interface ProtocolData {
  generated: string;
  insights: {
    title: string;
    description: string;
    confidence: number;
  }[];
  recommendations: {
    category: string;
    actions: string[];
  }[];
}

const PersonalProtocol: React.FC<PersonalProtocolProps> = ({ darkMode, userId }) => {
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProtocol();
  }, []);

  const fetchProtocol = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/protocol/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProtocol(data);
      }
    } catch (error) {
      console.error('Failed to fetch protocol:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProtocol = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/protocol/${userId}/generate`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setProtocol(data);
      }
    } catch (error) {
      console.error('Failed to generate protocol:', error);
    } finally {
      setGenerating(false);
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

  if (!protocol) {
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
          No Protocol Yet
        </h3>
        <p className={`text-sm mb-6 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          VERA will analyze your conversations and generate a personalized wellness protocol
        </p>
        <button
          onClick={generateProtocol}
          disabled={generating}
          className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-semibold transition-all ${
            darkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
          } disabled:opacity-50`}
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate My Protocol
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Your Personal Protocol
          </h3>
          <p className={`text-xs mt-1 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Generated {new Date(protocol.generated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateProtocol}
            disabled={generating}
            className={`p-2.5 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
            title="Regenerate"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
          </button>
          <button
            className={`p-2.5 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
            title="Download"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        <h4 className={`text-sm font-semibold uppercase tracking-wide ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          Key Insights
        </h4>
        {protocol.insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {insight.title}
              </h5>
              <div className={`flex items-center gap-1 text-xs ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                <TrendingUp size={12} />
                {insight.confidence}%
              </div>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className={`text-sm font-semibold uppercase tracking-wide ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          Recommended Actions
        </h4>
        {protocol.recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}
          >
            <h5 className={`font-semibold mb-3 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              {rec.category}
            </h5>
            <ul className="space-y-2">
              {rec.actions.map((action, actionIndex) => (
                <li
                  key={actionIndex}
                  className={`flex items-start gap-2 text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span className={`mt-1 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    •
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalProtocol;