'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasFeatureAccess, getDecodeLimit } from '@/lib/tiers';

export default function DecodePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>('explorer');
  const [usage, setUsage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    createNeurons();
  }, []);

  const createNeurons = () => {
    const container = document.getElementById('decodeNeurons');
    if (!container) return;

    container.innerHTML = '';

    // Create floating neurons
    for (let i = 0; i < 30; i++) {
      const neuron = document.createElement('div');
      neuron.className = 'decode-neuron';
      neuron.style.left = Math.random() * 100 + '%';
      neuron.style.top = Math.random() * 100 + '%';
      neuron.style.animationDelay = Math.random() * 20 + 's';
      neuron.style.animationDuration = (30 + Math.random() * 20) + 's';
      container.appendChild(neuron);
    }

    // Create consciousness waves
    for (let i = 0; i < 2; i++) {
      const wave = document.createElement('div');
      wave.className = 'decode-wave';
      wave.style.left = Math.random() * 100 + '%';
      wave.style.top = Math.random() * 100 + '%';
      wave.style.animationDelay = i * 15 + 's';
      container.appendChild(wave);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/auth/signin');
        return;
      }
      const data = await response.json();
      setUser(data.user);
      setUserTier(data.user.subscription_tier);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
    }
  };

  const handleDecode = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please provide at least 20 characters to decode.');
      return;
    }

    setIsDecoding(true);
    setError(null);
    setDecodeResult(null);

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          context: context.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgrade_required) {
          setError(data.error + '\n\nUpgrade to Regulator ($39/month) to access Decode.');
        } else {
          setError(data.error || 'Failed to decode text');
        }
        return;
      }

      setDecodeResult(data);
      setUsage(data.usage);
    } catch (error) {
      console.error('Decode error:', error);
      setError('Failed to decode text. Please try again.');
    } finally {
      setIsDecoding(false);
    }
  };

  const hasDecodeAccess = hasFeatureAccess(userTier as any, 'decode');
  const decodeLimit = getDecodeLimit(userTier as any);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 relative">
      {/* Neural Background */}
      <div className="decode-neurons-container" id="decodeNeurons"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .decode-neurons-container {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .decode-neuron {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: neuronFloat 40s infinite ease-in-out;
        }

        @keyframes neuronFloat {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: translate(30px, -30px) scale(1.2);
            opacity: 0.6;
          }
        }

        .decode-wave {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle,
            rgba(99, 102, 241, 0.05) 0%,
            rgba(139, 92, 246, 0.03) 30%,
            transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: waveBreath 50s infinite ease-in-out;
        }

        @keyframes waveBreath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.4;
          }
        }
      ` }} />

      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="text-slate-300 hover:text-white transition-colors text-sm"
            >
              ← Back to Chat
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 animate-pulse opacity-50" />
              </div>
              <div>
                <h1 className="text-xl font-normal text-white">DECODE</h1>
                <p className="text-xs text-slate-300">Biological Pattern Intelligence</p>
              </div>
            </div>
          </div>

          {usage && (
            <div className="text-sm text-slate-300">
              {usage.limit ? (
                <span>{usage.remaining}/{usage.limit} decodes remaining this month</span>
              ) : (
                <span>Unlimited decodes</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {!hasDecodeAccess ? (
          // Upgrade Wall
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Decode Communication Intelligence
            </h2>
            <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              Access Eva Leka's 20-year behavioral analysis framework. Decode nervous system patterns, psychological dynamics, and hidden meanings in any communication.
            </p>
            <div className="space-y-4 max-w-xl mx-auto text-left mb-8">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <p className="text-slate-700">Nervous system signature detection</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <p className="text-slate-700">Psychological subtext analysis</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <p className="text-slate-700">Relational dynamics mapping</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <p className="text-slate-700">Actionable response strategies</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = 'https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s'}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all shadow-lg text-lg"
            >
              Upgrade to Regulator - $39/month
            </button>
            <p className="text-sm text-slate-500 mt-4">Includes 5 decodes per month + all Regulator features</p>
          </div>
        ) : (
          // Decode Interface
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Text to Decode</h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the message, email, or communication you want to decode..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 placeholder-slate-400"
                  disabled={isDecoding}
                />
                <p className="text-xs text-slate-500 mt-2">
                  {text.length} characters (minimum 20 required)
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Context (Optional)</h2>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Add any relevant context: relationship, situation, background..."
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 placeholder-slate-400"
                  disabled={isDecoding}
                />
              </div>

              <button
                onClick={handleDecode}
                disabled={isDecoding || text.trim().length < 20}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {isDecoding ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Decoding...
                  </span>
                ) : (
                  'Decode Communication'
                )}
              </button>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm whitespace-pre-wrap">
                  {error}
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {decodeResult ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-6 max-h-[800px] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Decode Analysis</h2>
                  <div className="prose prose-slate max-w-none">
                    <div 
                      className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: decodeResult.decode.replace(/\n/g, '<br />') }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 animate-pulse" />
                  <p className="text-slate-500">
                    Paste communication and click "Decode" to see analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
