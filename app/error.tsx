'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 dark:from-slate-950 dark:via-purple-950/20 dark:to-blue-950/20 px-4">
      <div className="text-center max-w-md">
        {/* Animated Orb - Error State */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-6xl">⚠️</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
          Oops!
        </h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Something went wrong
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We encountered an unexpected error. Don't worry, it's not your fault.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-105 transition-all"
          >
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          If this keeps happening, contact us at{' '}
          <a 
            href="mailto:support@veraneural.com" 
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            support@veraneural.com
          </a>
        </p>
      </div>
    </div>
  );
}
