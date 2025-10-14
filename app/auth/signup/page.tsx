'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allGood = hasLength && hasLower && hasUpper && hasNumber;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!allGood) {
      setError('Password does not meet requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms');
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

      router.push('/orientation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
          <p className="text-slate-600 mt-2">Begin your journey with me</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8">
          <h2 className="text-2xl font-light text-slate-900 mb-6">Create Account</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Create password"
                disabled={isLoading}
              />

              {password && (
                <div className="mt-3 text-xs space-y-1">
                  <div className={hasLength ? 'text-green-600' : 'text-slate-400'}>
                    {hasLength ? '✓' : '○'} 8+ characters
                  </div>
                  <div className={hasUpper ? 'text-green-600' : 'text-slate-400'}>
                    {hasUpper ? '✓' : '○'} Uppercase letter
                  </div>
                  <div className={hasLower ? 'text-green-600' : 'text-slate-400'}>
                    {hasLower ? '✓' : '○'} Lowercase letter
                  </div>
                  <div className={hasNumber ? 'text-green-600' : 'text-slate-400'}>
                    {hasNumber ? '✓' : '○'} Number
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm password"
                disabled={isLoading}
              />
              {confirmPassword && (
                <div className={`mt-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '○ Passwords do not match'}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 rounded"
                disabled={isLoading}
              />
              <label className="text-xs text-slate-700">
                I understand VERA is <strong>NOT a medical device or therapist</strong>. 
                I will seek professional help when needed and call 988 or 911 in emergencies.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !allGood || !passwordsMatch || !acceptedTerms}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 shadow-lg"
            >
              {isLoading ? 'Creating Account...' : 'Start Free'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Have an account?{' '}
            <Link href="/auth/signin" className="text-purple-600 font-medium">Sign in</Link>
          </p>
        </div>

        <div className="p-4 bg-slate-100 rounded-xl">
          <p className="text-xs text-slate-600">
            <strong>⚠️ Important:</strong> VERA is NOT a substitute for medical care. 
            In crisis, call 988 or 911.
          </p>
        </div>
      </div>
    </div>
  );
}
