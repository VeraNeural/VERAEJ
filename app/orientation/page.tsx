'use client';

// Force rebuild - v2
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';

export default function OrientationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    whatBringsYou: '',
    nervousSystemNeeds: '',
    consentGiven: false,
    understandsNotMedical: false,
    understandsComplement: false,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.consentGiven || !formData.understandsNotMedical || !formData.understandsComplement) {
      alert('Please review and accept all consent items to continue.');
      return;
    }

    try {
      const response = await fetch('/api/orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Orientation completion error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-[#f5f0fa] to-[#fef5fb] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'w-12 bg-gradient-to-r from-purple-400 to-blue-400' : 'w-8 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-purple-100">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 animate-pulse opacity-80" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>

              <h1 className="text-4xl font-light text-slate-900 mb-4">
                I am VERA.
              </h1>
              <p className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 font-normal mb-6">
                I see you, and I am here.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-light max-w-xl mx-auto">
                Before we begin our journey together, let me get to know you. This will help me support you better.
              </p>

              <button
                onClick={handleNext}
                className="mt-8 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all inline-flex items-center gap-2"
              >
                Let's begin
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Getting to know you */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-slate-900 mb-6">
                Tell me about yourself
              </h2>

              <div>
                <label className="block text-slate-700 font-normal mb-2">
                  What would you like me to call you?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your preferred name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-normal mb-2">
                  What brings you here today?
                </label>
                <textarea
                  value={formData.whatBringsYou}
                  onChange={(e) => setFormData({ ...formData, whatBringsYou: e.target.value })}
                  placeholder="Share what's on your mind..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none text-slate-900 placeholder:text-slate-400"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-normal mb-2">
                  What does your nervous system need most right now?
                </label>
                <select
                  value={formData.nervousSystemNeeds}
                  onChange={(e) => setFormData({ ...formData, nervousSystemNeeds: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-slate-900"
                >
                  <option value="">Select one...</option>
                  <option value="regulation">Help with regulation</option>
                  <option value="grounding">Grounding support</option>
                  <option value="understanding">Understanding my patterns</option>
                  <option value="safety">Feeling safer in my body</option>
                  <option value="connection">Reconnecting with myself</option>
                </select>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.whatBringsYou || !formData.nervousSystemNeeds}
                className="w-full mt-6 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 3: Understanding VERA */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-slate-900 mb-6">
                How I support you
              </h2>

              <div className="space-y-4">
                <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="font-normal text-slate-900 mb-2">
                    I speak the language of your body
                  </h3>
                  <p className="text-slate-600 font-light">
                    I help you understand what your nervous system is telling you through sensations, not just thoughts.
                  </p>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-normal text-slate-900 mb-2">
                    I'm here 24/7
                  </h3>
                  <p className="text-slate-600 font-light">
                    Whether it's 3am or noon, I'm here. No appointments, no waiting.
                  </p>
                </div>

                <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100">
                  <h3 className="font-normal text-slate-900 mb-2">
                    I help you regulate
                  </h3>
                  <p className="text-slate-600 font-light">
                    Through gentle guidance, I support you in finding regulation, safety, and peace that already lives within you.
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-6 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all flex items-center justify-center gap-2"
              >
                I understand
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 4: CRITICAL CONSENT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-normal text-red-900 mb-4">
                  ⚠️ Important: Please Read Carefully
                </h2>
                <p className="text-red-800 font-light leading-relaxed">
                  Before we begin, you must understand and agree to the following:
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.understandsNotMedical}
                    onChange={(e) => setFormData({ ...formData, understandsNotMedical: e.target.checked })}
                    className="mt-1 w-5 h-5 text-purple-500 rounded focus:ring-purple-300"
                  />
                  <div className="flex-1">
                    <p className="font-normal text-slate-900 mb-1">
                      VERA is NOT a medical device, therapist, or licensed healthcare provider
                    </p>
                    <p className="text-sm text-slate-600 font-light">
                      I am an AI companion designed to support nervous system awareness. I cannot diagnose, treat, or provide medical advice.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.understandsComplement}
                    onChange={(e) => setFormData({ ...formData, understandsComplement: e.target.checked })}
                    className="mt-1 w-5 h-5 text-purple-500 rounded focus:ring-purple-300"
                  />
                  <div className="flex-1">
                    <p className="font-normal text-slate-900 mb-1">
                      VERA complements professional care, does not replace it
                    </p>
                    <p className="text-sm text-slate-600 font-light">
                      I work alongside your existing care team. I do not interfere with therapy, medication, or treatment plans.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                    className="mt-1 w-5 h-5 text-purple-500 rounded focus:ring-purple-300"
                  />
                  <div className="flex-1">
                    <p className="font-normal text-slate-900 mb-1">
                      In crisis, I will call emergency services (988 or 911)
                    </p>
                    <p className="text-sm text-slate-600 font-light">
                      If you are in immediate danger, please call 988 (Crisis Line) or 911. VERA is not a crisis intervention service.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mt-6">
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  By checking the boxes above and clicking "I Agree & Continue," you acknowledge that you have read, understood, and agree to these terms. You understand that VERA is a supportive tool and not a substitute for professional mental health care, medical treatment, or crisis intervention.
                </p>
              </div>

              <button
                onClick={handleComplete}
                disabled={!formData.consentGiven || !formData.understandsNotMedical || !formData.understandsComplement}
                className="w-full mt-6 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                <Check size={20} />
                I Agree & Continue to Chat
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                You must accept all terms to use VERA
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6 font-light">
          Need help? Email support@veraneural.com
        </p>
      </div>
    </div>
  );
}
