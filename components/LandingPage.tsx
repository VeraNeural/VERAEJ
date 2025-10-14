'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Shield, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = orb.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      mouseX = x / rect.width;
      mouseY = y / rect.height;
      
      orb.style.setProperty('--mouse-x', `${35 + mouseX * 15}%`);
      orb.style.setProperty('--mouse-y', `${35 + mouseY * 15}%`);
    };

    orb.addEventListener('mousemove', handleMouseMove);

    return () => {
      orb.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGetStarted = () => {
    window.location.href = `/auth/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600" />
            <span className="text-2xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 tracking-wide">VERA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/auth/signin"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimalist */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Your nervous system, understood.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                24/7 trauma-informed support that helps you regulate, ground, and find peace in your body.
              </p>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  Start Free
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500">
                7-day free trial • No credit card required
              </p>
            </div>

            {/* Minimal Breathing Orb */}
            <div className="relative flex items-center justify-center">
              <div className="orb-wrapper">
                <div 
                  ref={orbRef}
                  className="minimal-orb"
                >
                  <div className="orb-glow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Minimalist Grid */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built for your nervous system
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Trauma-informed AI that speaks the language of your body
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Body-first conversations',
                description: 'Start with sensations, not stories. Your body knows the truth.',
              },
              {
                icon: Clock,
                title: 'Always available',
                description: '3am panic attack? We\'re here. No appointments, no waiting.',
              },
              {
                icon: Shield,
                title: 'Private & secure',
                description: 'End-to-end encrypted. Your conversations stay yours.',
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                  <feature.icon className="text-slate-700" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Clean & Simple */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Start free, upgrade when ready
            </p>

            {/* Minimal Billing Toggle */}
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Annual
                <span className="ml-2 text-xs text-green-700">Save 26%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid - Minimal Cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Explorer */}
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-900 relative">
              <div className="absolute -top-3 left-8 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Explorer</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-slate-900">$29</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$269</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="text-sm text-green-700">Save $79/year</p>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited conversations',
                  'Save all chats',
                  'Voice responses',
                  'Pattern tracking',
                  'Mobile app access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-slate-900 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all text-center"
              >
                Start free trial
              </Link>
            </div>

            {/* Regulator */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Regulator</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-slate-900">$59</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$539</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="text-sm text-green-700">Save $169/year</p>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-slate-600 text-sm">Everything in Explorer, plus:</span>
                </li>
                {[
                  'Advanced pattern analysis',
                  'Custom protocols',
                  'Export transcripts',
                  'Priority support'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-slate-900 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all text-center"
              >
                Start free trial
              </Link>
            </div>

            {/* Integrator */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Integrator</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-slate-900">$99</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$899</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="text-sm text-green-700">Save $289/year</p>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-slate-600 text-sm">Everything in Regulator, plus:</span>
                </li>
                {[
                  'Weekly 1-on-1 with Eva',
                  'Private channel access',
                  'Personalized roadmap',
                  'Wearable integration'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-slate-900 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all text-center"
              >
                Start free trial
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8 text-sm">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start listening to your body
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            7-day free trial. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-all"
          >
            Get started free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600" />
              <span className="font-semibold text-slate-900">VERA</span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <a href="mailto:support@veraneural.com" className="hover:text-slate-900">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            © 2025 VERA. Not a substitute for professional care.
          </div>
        </div>
      </footer>

      {/* Minimal Orb Styles */}
      <style jsx>{`
        .orb-wrapper {
          width: 400px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .minimal-orb {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: 
            radial-gradient(circle at var(--mouse-x, 35%) var(--mouse-y, 35%), 
              rgba(148, 163, 184, 0.4) 0%, 
              rgba(100, 116, 139, 0.3) 50%, 
              rgba(71, 85, 105, 0.2) 100%);
          position: relative;
          animation: gentleBreathe 8s ease-in-out infinite;
          box-shadow: 
            inset 0 0 80px rgba(255, 255, 255, 0.3),
            0 0 100px rgba(148, 163, 184, 0.2),
            0 20px 60px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        @keyframes gentleBreathe {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.9;
          }
          50% { 
            transform: scale(1.05); 
            opacity: 1;
          }
        }

        .orb-glow {
          position: absolute;
          inset: 25%;
          border-radius: 50%;
          background: radial-gradient(circle at center,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%);
          animation: glowPulse 6s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        .minimal-orb:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }

        @media (max-width: 768px) {
          .orb-wrapper {
            width: 280px;
            height: 280px;
          }

          .minimal-orb {
            width: 240px;
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
}
