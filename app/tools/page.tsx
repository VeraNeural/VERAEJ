'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Heart, Brain, Wind, Loader2 } from 'lucide-react';

export default function ToolsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/auth/signin');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const tools = [
    {
      icon: Heart,
      title: 'Body Scan',
      description: 'Check in with your body and nervous system',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'Identify your adaptive codes and triggers',
      color: 'from-purple-500 to-blue-500',
    },
    {
      icon: Wind,
      title: 'Breathwork',
      description: 'Guided breathing exercises for regulation',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/chat')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Chat
          </button>
          <h1 className="text-2xl font-light text-white flex items-center gap-2">
            <Wrench size={24} />
            Wellness Tools
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto p-8">
        <p className="text-slate-400 text-center mb-8">
          Tools to support your nervous system and wellbeing
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                <tool.icon size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{tool.title}</h3>
              <p className="text-slate-400">{tool.description}</p>
              <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium">
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
