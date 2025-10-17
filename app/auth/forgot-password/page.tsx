'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-light text-slate-900 mb-4 text-center">Check your email</h1>
            <p className="text-slate-600 text-center mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>

            <Link
              href="/auth/signin"
              className="block text-center text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 animate-pulse opacity-80" />
            <div 
              className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse" 
              style={{ animationDelay: '0.5s' }}
            />
          </div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Reset your password</h1>
          <p className="text-slate-600 font-light">Enter your email and we'll send you reset instructions</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-normal mb-2">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-slate-600 hover:text-slate-700 text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6 font-light">
          Need help? Email support@veraneural.com
        </p>
      </div>
    </div>
  );
}
