'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb]">
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
              className="text-slate-600 hover:text-slate-900 font-normal transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all"
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
              
              <div className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-800 bg-white/80"
                />
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all flex items-center gap-2"
                >
                  Start Free
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500 font-light">
                No credit card required • Start for free
              </p>
            </div>

            {/* VERA's Living Orb - Beautiful */}
            <div className="relative flex items-center justify-center">
              <div className="orb-wrapper">
                <div 
                  ref={orbRef}
                  className="vera-orb"
                >
                  {/* Outer rings - nervous system pathways */}
                  <div className="orb-ring ring-1"></div>
                  <div className="orb-ring ring-2"></div>
                  <div className="orb-ring ring-3"></div>
                  {/* Core glow */}
                  <div className="orb-core"></div>
                  {/* Inner light */}
                  <div className="orb-light"></div>
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

      {/* Pricing - 2 Tiers Only */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-slate-600 mb-8 font-light">
              Start free, grow with me when ready
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="mb-8">
                <h3 className="text-xl font-normal text-slate-800 mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-light text-slate-900">$0</span>
                </div>
                <p className="text-slate-600 text-sm mt-2 font-light">Start your journey</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '10 messages per day',
                  '5 quick prompts per day',
                  'Brief pattern insights',
                  'Crisis resources',
                  'Journaling support'
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

            {/* EXPLORER $29 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200 relative shadow-lg">
              <div className="absolute -top-3 left-8 bg-slate-900 text-white text-xs font-normal px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-normal text-purple-700 mb-2">Explorer</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-light text-slate-900">$29</span>
                  <span className="text-slate-600 font-light">/month</span>
                </div>
                <p className="text-purple-600 text-sm font-light">Full access, unlimited growth</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited conversations',
                  'Unlimited prompts',
                  'Save all chats',
                  'Full pattern analysis',
                  'Voice responses',
                  'Priority support'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-800 font-light">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8 text-sm font-light">
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-6 bg-white/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-slate-600 text-base mb-8 font-light">
            Trusted by therapists and trauma specialists
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-slate-700 font-normal text-lg">Vision Design Studio</div>
            <div className="text-slate-700 font-normal text-lg">Regulate to Elevate</div>
            <div className="text-slate-700 font-normal text-lg">Board Certified Neuroscientists</div>
            <div className="text-slate-700 font-normal text-lg">Board Certified Neurologists</div>
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
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
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
              <a href="mailto:support@veraneural.com" className="hover:text-slate-900">Contact</a>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-500 font-light">
            © 2025 VERA. Not a substitute for professional care.
          </div>
        </div>
      </footer>

      {/* VERA's Orb Styles - Beautiful & Ethereal */}
      <style jsx>{`
        .orb-wrapper {
          width: 450px;
          height: 450px;
          max-width: 85vw;
          max-height: 85vw;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vera-orb {
          width: 350px;
          height: 350px;
          max-width: 75vw;
          max-height: 75vw;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(
            circle at var(--mouse-x, 40%) var(--mouse-y, 40%),
            rgba(196, 181, 253, 0.8) 0%,
            rgba(167, 139, 250, 0.6) 30%,
            rgba(139, 92, 246, 0.4) 60%,
            rgba(124, 58, 237, 0.2) 100%
          );
          box-shadow: 
            inset 0 0 80px rgba(255, 255, 255, 0.5),
            0 0 100px rgba(167, 139, 250, 0.4),
            0 20px 80px rgba(139, 92, 246, 0.3);
          animation: vera-breathe 6s ease-in-out infinite;
        }

        @keyframes vera-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .orb-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.3);
          pointer-events: none;
        }

        .ring-1 {
          inset: -30px;
          animation: ring-pulse 6s ease-in-out infinite;
        }

        .ring-2 {
          inset: -60px;
          animation: ring-pulse 6s ease-in-out infinite 2s;
        }

        .ring-3 {
          inset: -90px;
          animation: ring-pulse 6s ease-in-out infinite 4s;
        }

        @keyframes ring-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .orb-core {
          position: absolute;
          inset: 25%;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(196, 181, 253, 0.6) 40%,
            transparent 70%
          );
          animation: core-glow 4s ease-in-out infinite;
        }

        @keyframes core-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }

        .orb-light {
          position: absolute;
          inset: 35%;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          filter: blur(15px);
          animation: light-pulse 3s ease-in-out infinite;
        }

        @keyframes light-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @media (max-width: 768px) {
          .orb-wrapper {
            width: 320px;
            height: 320px;
          }

          .vera-orb {
            width: 260px;
            height: 260px;
          }
        }
      `}</style>
    </div>
  );
}
