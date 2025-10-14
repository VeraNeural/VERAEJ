import React, { useState } from 'react';
import { useDarkMode } from '@/lib/use-dark-mode';
import { Shield, X, FileText, AlertTriangle } from 'lucide-react';

export default function LegalFooter() {
  const { darkMode } = useDarkMode();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      {/* Footer Bar */}
      <div className={`border-t px-4 py-3 transition-colors duration-500 ${
        darkMode 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <div className={`flex items-center gap-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>© 2025 VERA AI. All rights reserved.</span>
            <button
              onClick={() => setShowDisclaimer(true)}
              className={`flex items-center gap-1 hover:underline ${
                darkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              <Shield size={14} />
              Medical Disclaimer
            </button>
          </div>
          <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
            Not a substitute for professional care
          </span>
        </div>
      </div>

      {/* Full Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl border max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl ${
            darkMode 
              ? 'bg-slate-900 border-purple-500/30' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                  }`}>
                    <AlertTriangle className={darkMode ? 'text-amber-400' : 'text-amber-600'} size={28} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Important Legal Disclaimer
                    </h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Please read carefully before using VERA
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <X className={darkMode ? 'text-slate-400' : 'text-slate-500'} size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Medical Disclaimer */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className={darkMode ? 'text-red-400' : 'text-red-600'} size={20} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
                      Medical & Mental Health Disclaimer
                    </h3>
                  </div>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-red-100' : 'text-red-900'
                  }`}>
                    <p>
                      <strong>VERA IS NOT A MEDICAL DEVICE, THERAPIST, COUNSELOR, OR HEALTHCARE PROVIDER.</strong> VERA is an educational tool designed to provide information about nervous system awareness and self-regulation techniques based on Eva Leka's personal methodology and lived experience.
                    </p>
                    <p>
                      <strong>VERA DOES NOT:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Diagnose, treat, cure, or prevent any medical or mental health condition</li>
                      <li>Provide medical, psychiatric, or psychological advice</li>
                      <li>Replace professional mental health care, therapy, or medical treatment</li>
                      <li>Prescribe medication or recommend stopping prescribed medications</li>
                      <li>Provide crisis intervention or emergency mental health services</li>
                      <li>Create a doctor-patient, therapist-client, or healthcare provider relationship</li>
                    </ul>
                  </div>
                </div>

                {/* Professional Care Notice */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-purple-900/20 border-purple-500/30' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    Always Consult Qualified Healthcare Professionals
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-purple-100' : 'text-purple-900'
                  }`}>
                    <p>
                      <strong>You must consult with qualified healthcare professionals before:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Making any decisions about your mental or physical health</li>
                      <li>Starting, stopping, or changing any medical treatment or medication</li>
                      <li>Using information from VERA for any medical or therapeutic purpose</li>
                      <li>Implementing any techniques or suggestions provided</li>
                    </ul>
                    <p className="font-semibold">
                      If you are experiencing a mental health crisis, thoughts of self-harm, or suicidal ideation, immediately contact emergency services (911 in the US) or a crisis helpline (988 in the US/Canada).
                    </p>
                  </div>
                </div>

                {/* Educational Purpose */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-blue-900/20 border-blue-500/30' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                    Educational & Informational Purpose Only
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-blue-100' : 'text-blue-900'
                  }`}>
                    <p>
                      VERA provides nervous system education based on Eva Leka's personal methodology developed through her lived experience with combat trauma, complex PTSD, and chronic health conditions. This methodology represents <strong>one person's experience and approach</strong> and may not be appropriate, safe, or effective for everyone.
                    </p>
                    <p>
                      The information provided is for educational purposes only and should not be considered medical advice, mental health treatment, or professional therapeutic intervention.
                    </p>
                  </div>
                </div>

                {/* No Guarantees */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    No Guarantees or Warranties
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <p>
                      VERA makes no representations, warranties, or guarantees about:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>The accuracy, completeness, or reliability of any information provided</li>
                      <li>The effectiveness or safety of any techniques or approaches suggested</li>
                      <li>Results, outcomes, or improvements from using VERA</li>
                      <li>The suitability of any information for your specific situation</li>
                    </ul>
                    <p className="font-semibold">
                      Your individual circumstances, health conditions, and needs may require different approaches. What worked for one person may not work for you.
                    </p>
                  </div>
                </div>

                {/* Liability Limitation */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-amber-900/20 border-amber-500/30' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                    Limitation of Liability
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-amber-100' : 'text-amber-900'
                  }`}>
                    <p>
                      By using VERA, you acknowledge and agree that:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You use VERA entirely at your own risk</li>
                      <li>VERA, its creators, and operators are not liable for any harm, injury, or adverse outcomes resulting from your use of the platform</li>
                      <li>You are solely responsible for decisions you make based on information from VERA</li>
                      <li>You will seek appropriate professional help for medical and mental health concerns</li>
                    </ul>
                  </div>
                </div>

                {/* Copyright */}
                <div className={`rounded-2xl p-6 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Copyright & Intellectual Property
                  </h3>
                  <div className={`space-y-3 text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <p>
                      © 2025 VERA AI. All rights reserved.
                    </p>
                    <p>
                      The VERA methodology, system prompts, adaptive codes framework, and all associated content are proprietary and protected by copyright law. The methodology is based on Eva Leka's personal lived experience and intellectual work.
                    </p>
                    <p>
                      Unauthorized reproduction, distribution, or commercial use of VERA's methodology, content, or systems is strictly prohibited without express written permission.
                    </p>
                  </div>
                </div>

                {/* Final Warning */}
                <div className={`rounded-2xl p-6 border-2 ${
                  darkMode 
                    ? 'bg-red-900/30 border-red-500' 
                    : 'bg-red-100 border-red-400'
                }`}>
                  <div className={`text-center space-y-3 ${darkMode ? 'text-red-100' : 'text-red-900'}`}>
                    <p className="text-lg font-bold">
                      ⚠️ IF YOU ARE IN CRISIS
                    </p>
                    <p className="text-sm leading-relaxed">
                      If you are experiencing thoughts of suicide, self-harm, or are in immediate danger:
                    </p>
                    <div className="space-y-2">
                      <p className="font-bold text-base">CALL 911 (US) or your local emergency services</p>
                      <p className="font-bold text-base">OR TEXT/CALL 988 (US/Canada Suicide & Crisis Lifeline)</p>
                    </div>
                    <p className="text-sm">
                      VERA cannot provide emergency crisis intervention. Your life matters. Please reach out for immediate professional help.
                    </p>
                  </div>
                </div>

                {/* Acceptance */}
                <div className={`text-center pt-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <p className="text-sm">
                    By continuing to use VERA, you acknowledge that you have read, understood, and agree to this disclaimer.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  I Understand and Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}