'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      // ✅ CHECK SUBSCRIPTION STATUS
      const hasActiveSubscription = data.user?.subscription_status === 'active' || 
        data.user?.subscription_status === 'trial';

      if (!hasActiveSubscription) {
        // No subscription - send to Stripe
        console.log('❌ No active subscription, redirecting to checkout');
        window.location.href = 'https://buy.stripe.com/14AcN50oL7PpgVbdPv8bS0r';
        return;
      }

      // ✅ Has subscription - proceed to app
      if (!data.user?.orientation_completed) {
        router.push('/orientation');
      } else {
        router.push('/chat');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              VERA
            </h1>
          </Link>
          <p className="text-slate-600 mt-2">Welcome back. I see you.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8">
          <h2 className="text-2xl font-light text-slate-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400"
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a 
                  href="mailto:support@veraneural.com?subject=Password Reset Request"
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/auth/signup?plan=explorer" className="text-purple-600 hover:text-purple-700 font-medium">
              Create account
            </Link>
          </p>
        </div>

        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">⚠️ Important:</strong> VERA is an AI companion for nervous system regulation. 
            She is <strong>NOT</strong> a substitute for medical advice, diagnosis, treatment, or professional mental health care. 
            In crisis, call 988 (Suicide & Crisis Lifeline) or 911 immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
