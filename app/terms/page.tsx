'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, AlertTriangle, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function TermsOfService() {
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 shadow-lg">
              <FileText className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-slate-600">Clear, honest terms for using VERA. No hidden surprises.</p>
            <p className="text-sm text-slate-500 mt-4">Last Updated: January 2025</p>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="p-8 md:p-12 space-y-12">
              
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Agreement to Terms</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  By creating an account and using VERA, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  These terms constitute a legally binding agreement between you and VERA Neural Systems. Please read them carefully.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What VERA Is</h2>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
                  <p className="text-slate-700 leading-relaxed mb-4">
                    VERA is an AI powered companion designed to support nervous system regulation through body first, trauma informed guidance. VERA offers:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                      <span>24/7 conversational support for nervous system awareness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                      <span>Pattern tracking and insights over time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                      <span>Grounding techniques and regulation tools</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                      <span>Saved conversation history for reflection</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 - Medical Disclaimer */}
              <section>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-300">
                  <div className="flex items-start gap-4 mb-4">
                    <AlertTriangle className="text-amber-600 flex-shrink-0" size={32} />
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-3">Critical: What VERA Is NOT</h2>
                      <div className="space-y-3 text-slate-700 font-medium">
                        <p className="leading-relaxed">
                          VERA is not a substitute for professional medical care, therapy, or crisis intervention.
                        </p>
                        <p className="leading-relaxed">
                          VERA is not a licensed therapist, counselor, psychiatrist, or medical professional.
                        </p>
                        <p className="leading-relaxed">
                          VERA cannot diagnose mental health conditions, prescribe medication, or provide emergency crisis support.
                        </p>
                        <p className="leading-relaxed">
                          If you are experiencing a mental health crisis, suicidal thoughts, or medical emergency, please call 988 (Suicide & Crisis Lifeline) or 911 immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Eligibility</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  You must be at least 18 years old to use VERA. By creating an account, you represent and warrant that you are 18 years of age or older.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  You must provide accurate, current, and complete information during registration and keep your account information updated.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Security</h2>
                <div className="space-y-3 text-slate-700">
                  <p className="leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
                  </p>
                  <p className="leading-relaxed">
                    You agree to immediately notify us of any unauthorized use of your account or any other security breach at support@veraneural.com.
                  </p>
                  <p className="leading-relaxed">
                    We cannot and will not be liable for any loss or damage arising from your failure to maintain account security.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Subscription and Payment</h2>
                <div className="space-y-4 text-slate-700">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Free Plan</h3>
                    <p className="leading-relaxed">VERA offers a free plan with limited features. We may change or discontinue the free plan at any time with reasonable notice.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Paid Plans</h3>
                    <p className="leading-relaxed">Paid subscriptions are billed monthly or annually in advance. All payments are processed securely through Stripe.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Free Trial</h3>
                    <p className="leading-relaxed">New users may access a 7 day free trial of paid features. You will not be charged during the trial period. Cancel anytime before the trial ends to avoid charges.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Cancellation</h3>
                    <p className="leading-relaxed">You may cancel your subscription at any time. You will continue to have access until the end of your current billing period. No refunds for partial months or years.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Price Changes</h3>
                    <p className="leading-relaxed">We may change our prices with 30 days notice. Price changes will not affect your current billing cycle.</p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptable Use</h2>
                <p className="text-slate-700 leading-relaxed mb-4">You agree not to:</p>
                <ul className="space-y-2 text-slate-700 ml-6">
                  <li className="leading-relaxed">• Use VERA for any illegal purpose or in violation of any laws</li>
                  <li className="leading-relaxed">• Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li className="leading-relaxed">• Transmit viruses, malware, or any other harmful code</li>
                  <li className="leading-relaxed">• Interfere with or disrupt the service or servers</li>
                  <li className="leading-relaxed">• Use automated systems (bots, scrapers) to access the service</li>
                  <li className="leading-relaxed">• Impersonate any person or entity or misrepresent your affiliation</li>
                  <li className="leading-relaxed">• Harass, abuse, or harm another person through the service</li>
                  <li className="leading-relaxed">• Use VERA to provide services to third parties</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
                <div className="space-y-3 text-slate-700">
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Our Content:</span> All content, features, and functionality of VERA, including but not limited to text, graphics, logos, and software, are owned by VERA Neural Systems and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Your Content:</span> You retain all rights to the content you create through conversations with VERA. By using the service, you grant us a limited license to store, process, and display your content solely for the purpose of providing the service to you.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-900">Feedback:</span> If you provide us with feedback or suggestions, you grant us the right to use such feedback without compensation or attribution.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed mb-4 font-medium">
                    To the maximum extent permitted by law, VERA Neural Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                  </p>
                  <ul className="space-y-2 text-slate-700 ml-6">
                    <li className="leading-relaxed">• Your use or inability to use the service</li>
                    <li className="leading-relaxed">• Any unauthorized access to or use of our servers and personal information</li>
                    <li className="leading-relaxed">• Any interruption or cessation of transmission to or from the service</li>
                    <li className="leading-relaxed">• Any bugs, viruses, or the like that may be transmitted through the service</li>
                    <li className="leading-relaxed">• Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the service</li>
                  </ul>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclaimer of Warranties</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  The service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  We do not warrant that the service will be uninterrupted, secure, or error free, or that any defects will be corrected.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
                <div className="space-y-3 text-slate-700">
                  <p className="leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these terms.
                  </p>
                  <p className="leading-relaxed">
                    Upon termination, your right to use the service will immediately cease. All provisions of these terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                  </p>
                  <p className="leading-relaxed">
                    You may terminate your account at any time by contacting us at support@veraneural.com or through your account settings.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We reserve the right to modify these terms at any time. If we make material changes, we will notify you via email and/or through a notice on our service at least 30 days before the changes take effect.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Your continued use of the service after the effective date of any changes constitutes acceptance of the modified terms.
                </p>
              </section>

              {/* Section 13 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
                <p className="text-slate-700 leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                </p>
              </section>

              {/* Section 14 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Dispute Resolution</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you have any dispute with us, you agree to first contact us at support@veraneural.com and attempt to resolve the dispute informally. If we cannot resolve the dispute within 30 days, either party may pursue formal dispute resolution.
                </p>
              </section>

              {/* Section 15 */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Severability</h2>
                <p className="text-slate-700 leading-relaxed">
                  If any provision of these terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                </p>
              </section>

              {/* Contact */}
              <section className="border-t border-slate-200 pt-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions About These Terms?</h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      If you have any questions about these Terms of Service, please contact us:
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