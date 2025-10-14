'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const passwordRequirements = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!allRequirementsMet) {
      setError('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.acceptedTerms) {
      setError('You must accept the terms and understand VERA\'s limitations');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Redirect to orientation
      router.push('/orientation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* VERA Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text tracking-wide">
              VERA
            </h1>
          </Link>
          <p className="text-slate-600 mt-2">Begin your journey with me</p>
        </div>

        {/* Sign-Up Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-8">
          <h2 className="text-2xl font-light text-slate-900 mb-6">Create Your Account</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.length ? <Check size={14} /> : <X size={14} />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.uppercase ? <Check size={14} /> : <X size={14} />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-slate-400'}`}>
                      {passwordRequirements.lowercase ? <Check size={14} /> : <X size={14} />}
                      <span>Lowercase letter</span>
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <input
                id="terms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                className="mt-1 w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-xs text-slate-700 leading-relaxed">
                I understand that VERA is <strong>NOT a medical device, therapist, or crisis intervention service</strong>. 
                VERA complements professional care but does not replace it. I will seek professional help when needed 
                and call 988 or 911 in emergencies.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch || !formData.acceptedTerms}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Creating Account...' : 'Start Free'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">⚠️ Important:</strong> VERA is an AI companion for nervous system regulation. 
            She is <strong>NOT</strong> a substitute for medical advice, diagnosis, treatment, or professional mental health care. 
            Always consult qualified healthcare providers for medical concerns. In crisis, call 988 (Suicide & Crisis Lifeline) 
            or 911 immediately.
          </p>
        </div>

        {/* What You Get */}
        <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Start Free, Upgrade Anytime</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-600"><strong>Free Tier:</strong> 10 messages/day, 5 quick prompts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-600"><strong>Explorer ($29/mo):</strong> Unlimited conversations, voice responses, full pattern analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
