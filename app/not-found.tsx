import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50/30 to-blue-50/20 dark:from-slate-950 dark:via-purple-950/20 dark:to-blue-950/20 px-4">
      <div className="text-center max-w-md">
        {/* Animated Orb */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white">?</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/chat"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            Go to Chat
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-105 transition-all"
          >
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Need help? Contact us at{' '}
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
