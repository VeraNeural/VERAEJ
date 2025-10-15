'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        // User is signed in - redirect to chat
        setIsSignedIn(true);
        setTimeout(() => {
          router.push('/chat');
        }, 2000); // Give them 2 seconds to see the success message
      } else {
        // User is not signed in
        setIsSignedIn(false);
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsSignedIn(false);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-slate-900 mb-2">Welcome to Explorer! 🎉</h1>
            <p className="text-green-800 mb-6">Your subscription is active. Taking you to VERA now...</p>
            <Loader2 className="w-6 h-6 text-green-600 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text mb-2">
            VERA
          </h1>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-light text-slate-900 mb-3">Payment Successful! 🎉</h2>
          <p className="text-green-800 text-lg mb-6">
            Welcome to Explorer! Your subscription is active.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-3">What's included:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Unlimited conversations with VERA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Unlimited quick prompts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Save all your chats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Full pattern analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Priority email support</span>
              </li>
            </ul>
          </div>

          <Link
            href="/auth/signin"
            className="block w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-lg"
          >
            Sign In to Start
          </Link>

          <p className="text-xs text-slate-600 mt-4">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Create one here
            </Link>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Need help? Email{' '}
            <a href="mailto:support@veraneural.com" className="text-purple-600 hover:text-purple-700 font-medium">
              support@veraneural.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
