'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Check } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: Choose Tier
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tier: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleTierSelect = async (tier: string) => {
    setFormData({ ...formData, tier });
    setError('');
    setLoading(true);

    try {
      // Step 1: Create account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tier }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupData.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      console.log('✅ Account created:', signupData.user);

      // Step 2: Create Stripe Checkout Session
      const checkoutResponse = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        setError(checkoutData.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      console.log('✅ Redirecting to Stripe checkout...');

      // Step 3: Redirect to Stripe
      window.location.href = checkoutData.url;
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 animate-pulse opacity-80" />
            <div 
              className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse" 
              style={{ animationDelay: '0.5s' }}
            />
          </div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Start your journey with VERA</h1>
          <p className="text-slate-600 font-light">7 days free, then continue with your chosen plan</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? 'bg-purple-500' : 'bg-slate-200'}`} />
          <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? 'bg-purple-500' : 'bg-slate-200'}`} />
        </div>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100 max-w-md mx-auto">
            <h2 className="text-2xl font-light text-slate-900 mb-6">Create your account</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-5">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-slate-700 font-normal mb-2">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-700 font-normal mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-700 font-normal mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-normal transition-all flex items-center justify-center gap-2"
              >
                Continue
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Choose Tier */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-light text-slate-900 mb-2 text-center">Choose your plan</h2>
            <p className="text-slate-600 text-center mb-8">All plans include a 7-day free trial</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6 max-w-2xl mx-auto">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Explorer */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100 hover:border-purple-300 transition-all">
                <h3 className="text-xl font-medium text-slate-900 mb-2">Explorer</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">$19</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Chat with VERA 24/7</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic nervous system tools</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Voice (10/day)</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleTierSelect('explorer')}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && formData.tier === 'explorer' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </button>
              </div>

              {/* Regulator */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-6 shadow-xl border-2 border-purple-300 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">Regulator</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">$39</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Explorer</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Voice (20/day)</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Access to courses</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Community access</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleTierSelect('regulator')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-xl font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && formData.tier === 'regulator' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </button>
              </div>

              {/* Integrator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100 hover:border-purple-300 transition-all">
                <h3 className="text-xl font-medium text-slate-900 mb-2">Integrator</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">$99</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Regulator</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited voice</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom courses</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">White label options</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleTierSelect('integrator')}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && formData.tier === 'integrator' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-8">
              💳 Card required • 7 days free • Cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
