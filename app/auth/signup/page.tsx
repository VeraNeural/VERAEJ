'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const passwordRequirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!allRequirementsMet) {
      setError('Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and understand VERA\'s limitations');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Redirect to orientation
      router.push('/orientation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              VERA
            </h1>
          </Link>
          <p className="text-slate-600 mt-2">Begin your journey with me</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8">
          <h2 className="text-2xl font-light text-slate-900 mb-6">Create Your Account</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Create a strong password"
                disabled={isLoading}
              />

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.length ? <Check size={14} /> : <X size={14} />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.uppercase ? <Check size={14} /> : <X size={14} />}
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.lowercase ? <Check size={14} /> : <X size={14} />}
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.number ? <Check size={14} /> : <X size={14} />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <label className="text-xs text-slate-700 leading-relaxed">
                I understand that VERA is <strong>NOT a medical device, therapist, or crisis intervention service</strong>. 
                VERA complements professional care but does not replace it. I will seek professional help when needed 
                and call 988 or 911 in emergencies.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch || !acceptedTerms}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Creating Account...' : 'Start Free'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">⚠️ Important:</strong> VERA is an AI companion for nervous system regulation. 
            She is <strong>NOT</strong> a substitute for medical advice, diagnosis, treatment, or professional mental health care. 
            In crisis, call 988 or 911 immediately.
          </p>
        </div>

        {/* Pricing Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Start Free, Upgrade Anytime</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
              <p className="text-xs text-slate-600"><strong>Free:</strong> 10 messages/day, 5 quick prompts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
              <p className="text-xs text-slate-600"><strong>Explorer ($29/mo):</strong> Unlimited conversations, voice responses, full pattern analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
