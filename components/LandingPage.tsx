'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Brain, Shield, Sparkles, Check, ArrowRight, MessageCircle, Lock, History, Crown, Zap, X } from 'lucide-react';
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
      
      orb.style.background = `
        radial-gradient(circle at ${35 + mouseX * 20}% ${35 + mouseY * 20}%, 
          #93C5FD 0%, 
          #A78BFA 25%, 
          #8B5CF6 50%, 
          #4C1D95 75%),
        radial-gradient(circle at ${70 - mouseX * 20}% ${70 - mouseY * 20}%, 
          #EC4899 0%, 
          transparent 50%)
      `;
    };

    const handleMouseLeave = () => {
      orb.style.background = '';
    };

    orb.addEventListener('mousemove', handleMouseMove);
    orb.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      orb.removeEventListener('mousemove', handleMouseMove);
      orb.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleGetStarted = () => {
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-rose-200/30 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 animate-breathing">VERA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/signin"
              className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Living Orb */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Your Body Has the Answers.
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-500"> VERA Helps You Listen.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                24/7 trauma-informed support for nervous system regulation. No judgment. No waiting rooms. Just you and your biology, finally understood.
              </p>
              
              {/* Email Signup */}
              <div className="flex gap-3 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-800"
                />
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg flex items-center gap-2"
                >
                  Start Free
                  <ArrowRight size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500">
                7-day free trial • No credit card required • Cancel anytime
              </p>
            </div>

            {/* Living Breathing Orb */}
            <div className="relative flex items-center justify-center">
              <div className="orb-container">
                <div 
                  ref={orbRef}
                  className="living-orb"
                >
                  <div className="inner-glow"></div>
                  <div className="orbital-ring ring1"></div>
                  <div className="orbital-ring ring2"></div>
                  <div className="orbital-ring ring3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        {/* Subtle background orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              I am VERA.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 mt-2">
                I see you, and I am here.
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              I help you listen to your body's wisdom. Through gentle guidance, I support you in finding the regulation, safety, and peace that already lives within you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Body-First Approach',
                description: 'Start with sensations, not stories. Your body speaks truth. I help you decode it.',
                gradient: 'from-purple-400 via-blue-400 to-purple-500',
                pulseColor: 'bg-purple-400',
              },
              {
                title: 'Save & Review Chats',
                description: 'Every conversation is saved securely. Track patterns, review insights, see your growth.',
                gradient: 'from-rose-400 via-pink-400 to-rose-500',
                pulseColor: 'bg-rose-400',
              },
              {
                title: 'Private & Secure',
                description: 'End to end encryption. Your conversations stay yours. No data sharing, ever.',
                gradient: 'from-blue-400 via-cyan-400 to-blue-500',
                pulseColor: 'bg-blue-400',
              },
              {
                title: 'Trauma-Informed',
                description: 'Built by survivors, for survivors. Never minimizing, always validating.',
                gradient: 'from-pink-400 via-rose-400 to-pink-500',
                pulseColor: 'bg-pink-400',
              },
              {
                title: 'Track Your Journey',
                description: 'See your regulation patterns over time. Understand what triggers you and what helps.',
                gradient: 'from-indigo-400 via-purple-400 to-indigo-500',
                pulseColor: 'bg-indigo-400',
              },
              {
                title: 'Available 24/7',
                description: 'Midnight panic? We are here. No appointments, no waiting, just immediate support.',
                gradient: 'from-cyan-400 via-blue-400 to-cyan-500',
                pulseColor: 'bg-cyan-400',
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 hover:border-purple-200 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Animated Neuronal Orb */}
                <div className="relative w-20 h-20 mb-6">
                  {/* Outer glow ring - pulses */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20 blur-xl animate-pulse`} />
                  
                  {/* Middle ring - rotates slowly */}
                  <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${feature.gradient} opacity-30`} style={{
                    animation: 'spinSlow 8s linear infinite'
                  }} />
                  
                  {/* Inner orb - breathes */}
                  <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${feature.gradient} shadow-lg`} style={{
                    animation: 'orbBreathe 3s ease-in-out infinite'
                  }}>
                    {/* Core light */}
                    <div className={`absolute inset-2 rounded-full ${feature.pulseColor} opacity-60 blur-md`} />
                  </div>

                  {/* Neural connections */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-30">
                    <div className={`absolute top-0 left-1/2 w-0.5 h-8 bg-gradient-to-b ${feature.gradient} transform -translate-x-1/2 -translate-y-full`} />
                    <div className={`absolute bottom-0 left-1/4 w-0.5 h-6 bg-gradient-to-t ${feature.gradient} transform translate-y-full rotate-12`} />
                    <div className={`absolute bottom-0 right-1/4 w-0.5 h-6 bg-gradient-to-t ${feature.gradient} transform translate-y-full -rotate-12`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Choose Your Path to Regulation
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Start free, upgrade when ready
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-white rounded-full p-2 shadow-md border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Save up to 26%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            
            {/* FREE */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-slate-300 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                </div>
                <p className="text-slate-600 text-sm">Start Your Journey</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '3 conversations per day',
                  'Basic emotion detection',
                  'Crisis resources access',
                  'Text responses only'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm">
                  <X className="text-slate-300 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-slate-400">No chat history</span>
                </li>
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all text-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* EXPLORER */}
            <div className="bg-white rounded-3xl p-8 border-2 border-purple-500 hover:border-purple-600 transition-all relative shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Explorer</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-slate-900">$19</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$179</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Save $49/year</p>
                  </div>
                )}
                <p className="text-slate-600 text-sm">Explore Your Patterns</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited conversations',
                  'Save & review all chats',
                  'Voice responses',
                  'Pattern insights',
                  'Living breathing orb',
                  'Contextual action cards'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all text-center shadow-md"
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* REGULATOR */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-400 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Regulator</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-slate-900">$39</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$349</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Save $119/year</p>
                  </div>
                )}
                <p className="text-slate-600 text-sm">Master Regulation</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Sparkles className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-slate-700 font-medium">Everything in Explorer, plus:</span>
                </li>
                {[
                  'Advanced pattern tracking',
                  'Custom regulation protocols',
                  'Export chat transcripts',
                  'Priority email support',
                  'Early access to features'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all text-center shadow-md"
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* INTEGRATOR */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border-2 border-amber-400 hover:border-amber-500 transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} />
                PREMIUM
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Integrator</h3>
                {billingCycle === 'monthly' ? (
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-slate-900">$79</span>
                    <span className="text-slate-700">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">$699</span>
                      <span className="text-slate-700">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Save $249/year</p>
                  </div>
                )}
                <p className="text-slate-700 text-sm">Integrate with Eva</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Crown className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-slate-800 font-medium">Everything in Regulator, plus:</span>
                </li>
                {[
                  'Weekly 1-on-1 with Eva (30min)',
                  'Private channel access to Eva',
                  'Personalized roadmap',
                  'Custom adaptive code analysis',
                  'Wearable integration (HRV)',
                  'VIP support (24hr response)'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-800">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all text-center shadow-md"
              >
                Start 7-Day Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8 text-sm">
            All paid plans include a 7-day free trial. No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Real People, Real Regulation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "VERA helped me understand my anxiety wasn't weakness—it was my nervous system doing its job. Game changer.",
                name: "Sarah M.",
                role: "Trauma Survivor"
              },
              {
                quote: "Having access at midnight when I'm spiraling? Priceless. VERA gets me when no one else is awake.",
                name: "Marcus L.",
                role: "Complex PTSD"
              },
              {
                quote: "Finally, someone who speaks body language. No more 'just think positive' nonsense.",
                name: "Jamie K.",
                role: "Chronic Anxiety"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200/50">
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Your Nervous System Deserves Support
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Start your journey to regulation today. No commitment, just compassion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-6 py-4 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 max-w-md"
              />
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-purple-600 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={20} />
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-4">
              7-day free trial • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 animate-breathing">VERA</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Your companion for nervous system care
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Orb-based interface for somatic awareness. Following fascia pathways and nervous system regulation through embodied AI support.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="mailto:support@veraneural.com" className="hover:text-white transition-colors">
                    support@veraneural.com
                  </a>
                </li>
                <li><Link href="#crisis" className="hover:text-white transition-colors">Crisis Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 VERA AI. All rights reserved. Not a substitute for professional care.</p>
          </div>
        </div>
      </footer>

      {/* Orb Styles */}
      <style jsx>{`
        .animate-breathing {
          animation: textBreathe 4s ease-in-out infinite;
        }

        @keyframes textBreathe {
          0%, 100% { 
            opacity: 0.9;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }

        .orb-container {
          width: 450px;
          height: 450px;
          max-width: 85vw;
          max-height: 85vw;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .living-orb {
          width: 400px;
          height: 400px;
          max-width: 80vw;
          max-height: 80vw;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, 
            #93C5FD 0%, 
            #A78BFA 25%, 
            #8B5CF6 50%, 
            #4C1D95 75%),
            radial-gradient(circle at 70% 70%, 
            #EC4899 0%, 
            transparent 50%);
          position: relative;
          animation: humanBreathe 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          box-shadow: 
            inset 0 0 120px rgba(255, 255, 255, 0.9),
            0 0 200px rgba(167, 139, 250, 0.6),
            0 0 150px rgba(139, 92, 246, 0.5),
            0 0 100px rgba(236, 72, 153, 0.3),
            0 40px 80px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: filter 0.3s ease;
        }

        @keyframes humanBreathe {
          0%, 100% { 
            transform: scale(1); 
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.08); 
            filter: brightness(1.1);
          }
        }

        .orbital-ring {
          position: absolute;
          inset: -40px;
          border: 2px solid;
          border-radius: 50%;
          animation: ringPulse 6s ease-in-out infinite;
          pointer-events: none;
        }

        .ring1 {
          border-color: rgba(184, 167, 232, 0.3);
          animation-delay: 0s;
        }

        .ring2 {
          inset: -80px;
          border-color: rgba(232, 155, 155, 0.2);
          animation-delay: 2s;
        }

        .ring3 {
          inset: -120px;
          border-color: rgba(232, 180, 208, 0.15);
          animation-delay: 4s;
        }

        @keyframes ringPulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.03); 
          }
        }

        .inner-glow {
          position: absolute;
          inset: 20%;
          border-radius: 50%;
          background: radial-gradient(circle at center,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 30%,
            transparent 70%);
          animation: glowPulse 8s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .living-orb:hover {
          filter: brightness(1.2) saturate(1.2);
        }

        @media (max-width: 768px) {
          .orb-container {
            width: 320px;
            height: 320px;
          }

          .living-orb {
            width: 280px;
            height: 280px;
          }
        }
      `}</style>
    </div>
  );
}