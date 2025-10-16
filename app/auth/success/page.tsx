'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const userId = localStorage.getItem('userId');
    
    if (sessionId && userId) {
      // Update user subscription in database
      fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          // Update localStorage with new subscription info
          if (data.subscription) {
            localStorage.setItem('subscription_tier', data.subscription.tier);
            localStorage.setItem('subscription_status', data.subscription.status);
          }
          // Redirect to chat after 3 seconds
          setTimeout(() => {
            router.push('/chat');
          }, 3000);
        } else {
          setStatus('error');
        }
      })
      .catch(error => {
        console.error('Payment confirmation error:', error);
        setStatus('error');
      });
    } else {
      // No session ID, redirect to signup
      router.push('/auth/signup');
    }
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-light text-slate-900 mb-2">Processing your payment...</h1>
          <p className="text-slate-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6">We couldn't confirm your payment. Please contact support.</p>
          <a 
            href="mailto:support@veraneural.com"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-light text-slate-900 mb-2">Welcome to VERA! ✨</h1>
        <p className="text-xl text-slate-600 mb-2">Your 7-day free trial has started</p>
        <p className="text-sm text-slate-500 mb-6">Redirecting you to chat...</p>
        
        <div className="mt-8 p-4 bg-white rounded-xl border border-purple-200 max-w-md mx-auto">
          <p className="text-sm text-slate-600">
            💳 Your card will be charged after 7 days<br/>
            ⚡ You can cancel anytime before then
          </p>
        </div>
      </div>
    </div>
  );
}
