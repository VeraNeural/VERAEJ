'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
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

  const handleGetStarted = async () => {
    // Capture email as lead FIRST (even if they don't complete signup)
    if (email) {
      try {
        await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email,
            source: 'landing_page_hero'
          }),
        });
        console.log('✅ Lead captured');
      } catch (error) {
        console.error('Lead capture failed:', error);
      }
    }
    
    // Then redirect to signup with email pre-filled
    window.location.href = `/auth/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb]">
      {/* Announcement Popup */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl shadow-2xl border border-purple-200 relative">
            <button 
              onClick={() => setShowAnnouncement(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>
            
            {/* Small breathing orb */}
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 animate-pulse opacity-80" />
            </div>

            <h2 className="text-4xl font-light text-slate-900 mb-4 text-center">
              I am VERA
            </h2>
            <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 font-normal mb-6 text-center">
              Your co-regulator for life
            </p>
            
            <div className="space-y-4 text-center mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                I am here to help you listen to your body's wisdom. Together, we decode the language of your nervous system.
              </p>
              <p className="text-slate-600 font-light">
                I am evolving. I am learning. I am here for you — 24/7, trauma-informed, body-first.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setShowAnnouncement(false);
                  document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-normal transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-purple-100/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 opacity-80" />
            <span className="text-2xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 tracking-wide">VERA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/signin"
              className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-normal transition-all border-2 border-purple-200 hover:border-purple-300 shadow-sm"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-light text-slate-900 mb-6 leading-tight tracking-tight">
                I am VERA.
                <span className="block font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 mt-2">
                  I see you, and I am here.
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light">
                I help you listen to your body's wisdom. Through gentle guidance, I support you in finding the regulation, safety, and peace that already lives within you.
              </p>
              
              {/* Highlighted Email Input */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg mb-4">
                <p className="text-sm text-purple-700 font-medium mb-3 text-center">
                  ✨ Start your journey today — free
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-4 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 bg-white shadow-sm text-lg placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleGetStarted}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    Start Free
                    <ArrowRight size={18} />
                  </button>
                </div>
                <p className="text-xs text-slate-600 font-light mt-3 text-center">
                  No credit card required • 10 free messages daily
                </p>
              </div>
            </div>

            {/* VERA's Living Orb */}
            <div className="relative flex items-center justify-center">
              <div className="central-orb-container">
                <div 
                  ref={orbRef}
                  className="central-orb"
                  id="veraOrb"
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
      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Built for your nervous system
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              I speak the language of your body
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Body-first conversations',
                description: 'Start with sensations, not stories. Your body knows the truth.',
              },
              {
                title: 'Always here',
                description: '3am panic? I am here. No appointments, no waiting.',
              },
              {
                title: 'Private & secure',
                description: 'Your conversations stay yours. Always.',
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-purple-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                </div>
                <h3 className="text-xl font-normal text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Real people, real regulation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "VERA helped me understand my anxiety wasn't weakness - it was my nervous system doing its job.",
                name: "Sarah M.",
                role: "Trauma Survivor"
              },
              {
                quote: "Having access at midnight when I'm spiraling? Life-changing. VERA sees me when no one else is awake.",
                name: "Marcus L.",
                role: "Complex PTSD"
              },
              {
                quote: "Finally, someone who speaks body language. No more thinking my way out of panic.",
                name: "Jamie K.",
                role: "Chronic Anxiety"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-slate-100">
                <p className="text-slate-700 mb-6 leading-relaxed font-light italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-normal text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-500 text-sm font-light">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Replace your Pricing section with this */}

{/* Pricing - 3 Tiers */}
<section className="py-24 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-light text-slate-900 mb-4">
        Choose Your Path
      </h2>
      <p className="text-xl text-slate-600 mb-8 font-light">
        Start free, grow when you're ready
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* FREE TIER */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="mb-8">
          <h3 className="text-xl font-normal text-slate-800 mb-2">Free</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-slate-900">$0</span>
          </div>
          <p className="text-slate-600 text-sm mt-2 font-light">Try VERA today</p>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            '10 messages per day',
            '5 quick prompts per day',
            'Daily journal notifications',
            'Crisis resources',
            'Brief pattern insights'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-slate-700 font-light">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/auth/signup"
          className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-normal transition-all text-center"
        >
          Start Free
        </Link>
      </div>

      {/* EXPLORER $19 - MOST POPULAR */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200 relative shadow-lg transform scale-105">
        <div className="absolute -top-3 left-8 bg-slate-900 text-white text-xs font-normal px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-normal text-purple-700 mb-2">Explorer</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-light text-slate-900">$19</span>
            <span className="text-slate-600 font-light">/month</span>
          </div>
          <p className="text-purple-600 text-sm font-light">Full access for daily wellness</p>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            'Unlimited conversations',
            'Unlimited quick prompts',
            'Full journal with prompts',
            'Daily check-in tracking',
            'View wellness protocols',
            'Save all your chats'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-slate-800 font-light">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={process.env.NEXT_PUBLIC_STRIPE_EXPLORER_LINK || '/auth/signup'}
          className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all text-center"
        >
          Get Explorer
        </Link>
      </div>

      {/* REGULATOR $39 */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="mb-8">
          <h3 className="text-xl font-normal text-slate-800 mb-2">Regulator</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-light text-slate-900">$39</span>
            <span className="text-slate-600 font-light">/month</span>
          </div>
          <p className="text-slate-600 text-sm font-light">Advanced nervous system tools</p>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            'Everything in Explorer, plus:',
            'Full Protocol feature — create & track wellness routines',
            'Dashboard analytics & insights',
            'Voice response feature',
            'Deep pattern analysis',
            'Priority email support'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <span className={`font-light ${idx === 0 ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href={process.env.NEXT_PUBLIC_STRIPE_REGULATOR_LINK || '/auth/signup'}
          className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-normal transition-all text-center"
        >
          Get Regulator
        </Link>
      </div>
    </div>

    <p className="text-center text-slate-500 mt-8 text-sm font-light">
      All plans include end-to-end encryption • Cancel anytime
    </p>
  </div>
</section>

      {/* Partners Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 border-y border-purple-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-slate-700 text-lg mb-12 font-normal">
            Trusted by therapists and trauma specialists
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
              </div>
              <p className="text-slate-800 font-normal">Vision Design Studio</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-pink-400" />
              </div>
              <p className="text-slate-800 font-normal">Regulate to Elevate</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
              </div>
              <p className="text-slate-800 font-normal">Board Certified Neuroscientists</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
              </div>
              <p className="text-slate-800 font-normal">Board Certified Neurologists</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-light mb-4">
              I am here for you
            </h2>
            <p className="text-xl mb-8 text-slate-200 font-light">
              Start listening to your body today. No commitment, just compassion.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-normal transition-all"
            >
              Start Free
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stay Connected - Lead Capture */}
      <section className="py-16 px-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-t border-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light text-slate-900 mb-4">
            Stay connected with VERA
          </h2>
          <p className="text-slate-600 mb-8 font-light">
            Get updates about new features, nervous system insights, and community support.
          </p>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email');
              
              try {
                await fetch('/api/leads/capture', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    email,
                    source: 'footer_newsletter'
                  }),
                });
                alert('✅ Thank you! We\'ll keep you updated.');
                e.currentTarget.reset();
              } catch (error) {
                alert('Something went wrong. Please try again.');
              }
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all whitespace-nowrap"
            >
              Keep Me Updated
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-slate-600 text-sm mb-3 font-light">
              Have a question? We're here to help.
            </p>
            <a 
              href="mailto:support@veraneural.com"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-normal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@veraneural.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 opacity-80" />
              <span className="font-normal text-slate-900">VERA</span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-600 font-light">
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-500 font-light">
            © 2025 VERA. Not a substitute for professional care.
          </div>
        </div>
      </footer>

      {/* VERA's Orb Styles */}
      <style jsx>{`
        .central-orb-container {
          width: 650px;
          height: 650px;
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .central-orb {
          width: 550px;
          height: 550px;
          max-width: 85vw;
          max-height: 85vw;
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
          animation: orbBreathe 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          box-shadow: 
            inset 0 0 150px rgba(255, 255, 255, 0.9),
            0 0 300px rgba(167, 139, 250, 0.7),
            0 0 250px rgba(139, 92, 246, 0.6),
            0 0 200px rgba(236, 72, 153, 0.3),
            0 60px 120px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: filter 0.3s ease;
        }

        @keyframes orbBreathe {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.12) rotate(5deg); 
            filter: brightness(1.15);
          }
        }

        .orbital-ring {
          position: absolute;
          inset: -50px;
          border: 2px solid;
          border-radius: 50%;
          animation: ringPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .ring1 {
          border-color: rgba(184, 167, 232, 0.3);
          animation-delay: 0s;
        }

        .ring2 {
          inset: -100px;
          border-color: rgba(232, 155, 155, 0.2);
          animation-delay: 2s;
        }

        .ring3 {
          inset: -150px;
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
            transform: scale(1.05); 
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
          animation: innerPulse 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes innerPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .central-orb:hover {
          filter: brightness(1.2) saturate(1.2);
        }

        @media (max-width: 768px) {
          .central-orb-container {
            width: 400px;
            height: 400px;
          }

          .central-orb {
            width: 320px;
            height: 320px;
          }
        }

        @media (max-width: 480px) {
          .central-orb-container {
            width: 320px;
            height: 320px;
          }

          .central-orb {
            width: 280px;
            height: 280px;
          }
        }
      `}</style>
    </div>
  );
}
