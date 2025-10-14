'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-rose-200/30 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} className="text-slate-600" />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 animate-breathing">VERA</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-lg">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-slate-600">Your privacy is not negotiable. Here's exactly how we protect it.</p>
            <p className="text-sm text-slate-500 mt-4">Last Updated: January 2025</p>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="p-8 md:p-12 space-y-12">
              
              {/* Section 1 */}
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Lock className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Commitment to You</h2>
                    <p className="text-slate-700 leading-relaxed">
                      VERA is built on trust. We collect only what is necessary to provide you with a safe, personalized nervous system support experience. We never sell your data. We never share your conversations. Your healing journey belongs to you alone.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Database className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">What We Collect</h2>
                    <div className="space-y-4 text-slate-700">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">Account Information</h3>
                        <p className="leading-relaxed">Your name, email address, and encrypted password. We use this to create and secure your account.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">Conversation Data</h3>
                        <p className="leading-relaxed">Every message you send to VERA and every response she provides. This is stored securely and encrypted so you can track your regulation patterns over time.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">Usage Information</h3>
                        <p className="leading-relaxed">When you use VERA, how often, and which features you engage with. This helps us improve the experience for everyone.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">Payment Information</h3>
                        <p className="leading-relaxed">If you subscribe to a paid plan, your payment is processed securely through Stripe. We never see or store your full credit card details.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Eye className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">How We Use Your Information</h2>
                    <div className="space-y-3 text-slate-700">
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">To provide VERA's support:</span> Your conversations help VERA understand your patterns and offer personalized nervous system guidance.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">To show you your journey:</span> Your saved chats and pattern insights are available in your dashboard for reflection and growth.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">To improve our service:</span> Anonymized, aggregated data helps us understand what works and what doesn't, so we can make VERA better for everyone.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">To communicate with you:</span> Important updates, security alerts, and responses to your support requests.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">How We Protect Your Information</h2>
                    <div className="space-y-3 text-slate-700">
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">End to end encryption:</span> Your conversations are encrypted in transit and at rest. Even we cannot read them without your authentication.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">Secure infrastructure:</span> We use industry standard security practices, including secure databases, encrypted connections, and regular security audits.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">Limited access:</span> Only essential personnel have access to systems containing your data, and all access is logged and monitored.
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-900">Regular backups:</span> Your data is backed up regularly to prevent loss, and all backups are encrypted.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Never Do</h2>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50">
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 font-bold text-xl">×</span>
                      <span className="leading-relaxed">We never sell your data to third parties. Ever.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 font-bold text-xl">×</span>
                      <span className="leading-relaxed">We never share your conversations with anyone without your explicit consent.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 font-bold text-xl">×</span>
                      <span className="leading-relaxed">We never use your data for advertising or marketing purposes beyond our own service.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 font-bold text-xl">×</span>
                      <span className="leading-relaxed">We never share personally identifiable information with AI training datasets.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                <div className="space-y-3 text-slate-700">
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Access your data:</span> You can view all your conversations and account information anytime in your dashboard.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Export your data:</span> Request a complete copy of your data in a portable format.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Delete your data:</span> You can delete individual conversations or your entire account at any time. Deletion is permanent.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Opt out:</span> You can opt out of non essential communications anytime.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We retain your data for as long as your account is active. If you delete your account, we will delete all your personal data within 30 days, except where we are required by law to retain certain information.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Anonymized, aggregated data (with no personally identifiable information) may be retained for research and service improvement purposes.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We use essential cookies to keep you logged in and remember your preferences. We do not use third party advertising or tracking cookies.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  We use basic analytics to understand how VERA is used, but all analytics data is anonymized and aggregated.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We may update this privacy policy from time to time. If we make significant changes, we will notify you via email and display a notice in the app. Your continued use of VERA after changes are posted constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
                <p className="text-slate-700 leading-relaxed">
                  VERA is not intended for use by anyone under the age of 18. We do not knowingly collect information from children. If we discover that we have inadvertently collected data from a child, we will delete it immediately.
                </p>
              </section>

              {/* Contact */}
              <section className="border-t border-slate-200 pt-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions or Concerns?</h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      If you have any questions about this privacy policy or how we handle your data, please contact us:
                    </p>
                    <a 
                      href="mailto:support@veraneural.com"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      <Mail size={18} />
                      support@veraneural.com
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Breathing animation */}
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
      `}</style>
    </div>
  );
}