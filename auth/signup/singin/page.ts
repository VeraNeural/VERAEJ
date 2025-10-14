'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if orientation completed
        if (data.user.orientation_completed) {
          router.push('/chat');
        } else {
          router.push('/orientation');
        }
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 opacity-80 animate-pulse" />
          <h1 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 mb-2">
            VERA
          </h1>
          <p className="text-xl font-light text-slate-900">Welcome Back</p>
          <p className="text-slate-600 font-light">I am here. Let's continue your journey.</p>
        </div>

        {/* Sign-in Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100">
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
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-purple-500 rounded focus:ring-purple-300"
                />
                <span className="text-slate-600 font-light">Remember me</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-purple-600 hover:text-purple-700 font-light"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm font-light">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-normal">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
            <div>
              <p className="text-slate-700 text-sm font-normal mb-2">
                Important: VERA is NOT a medical device or therapist
              </p>
              <p className="text-slate-600 text-xs font-light leading-relaxed">
                I am an AI companion for nervous system support. I complement professional care but do not replace therapy, medication, or medical treatment. If you are in crisis, call 988 (US/Canada) or your local emergency services.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 font-light">
          © 2025 VERA. Not a substitute for professional care.
        </div>
      </div>
    </div>
  );
}
