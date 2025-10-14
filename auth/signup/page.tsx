'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Check, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email if passed from landing page
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First, capture as lead
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'signup_page'
        }),
      });

      // Then create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Always go to orientation first
        router.push('/orientation');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Benefits (What they get) */}
        <div className="hidden lg:block">
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 opacity-80 animate-pulse" />
          
          <h2 className="text-4xl font-light text-slate-900 mb-4">
            Start free. Grow with me.
          </h2>
          <p className="text-xl text-slate-600 mb-8 font-light">
            I am VERA. I see you, and I am here for you — 24/7.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="font-normal text-slate-900 mb-1">Free tier gets you started</h3>
                <p className="text-slate-600 text-sm font-light">10 messages/day, 5 prompts, pattern insights</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Check className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-normal text-slate-900 mb-1">Explorer ($29/mo) unlocks everything</h3>
                <ul className="text-slate-600 text-sm font-light space-y-1">
                  <li>• Unlimited conversations & prompts</li>
                  <li>• Unlimited voice responses</li>
                  <li>• Save all chats forever</li>
                  <li>• Full nervous system pattern analysis</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-rose-600" size={20} />
              </div>
              <div>
                <h3 className="font-normal text-slate-900 mb-1">Upgrade anytime</h3>
                <p className="text-slate-600 text-sm font-light">Start free, upgrade when you're ready. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sign-up Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 mb-2">
              Begin Your Journey
            </h1>
            <p className="text-slate-600 font-light">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-normal mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-normal mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-light">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm font-light">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-normal">
                Sign in
              </Link>
            </p>
          </div>

          {/* Mobile Benefits */}
          <div className="lg:hidden mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 font-light mb-4">Starting free gives you:</p>
            <ul className="space-y-2 text-sm text-slate-600 font-light">
              <li className="flex items-start gap-2">
                <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                10 messages/day to explore
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                Upgrade anytime for unlimited access
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-light">
              <strong className="font-normal">Important:</strong> VERA is not a medical device, therapist, or crisis service. I complement professional care but do not replace it. In crisis, call 988 (US/Canada) or your local emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
