'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        router.push('/auth/signin');
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
        
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Name</label>
              <input 
                type="text" 
                value={user?.name || ''} 
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
