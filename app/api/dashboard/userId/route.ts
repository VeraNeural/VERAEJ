import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculate date range
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : 30;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Fetch check-ins
    const { data: checkIns, error: checkInError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (checkInError) {
      console.error('Error fetching check-ins:', checkInError);
    }

    // Fetch journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
    }

    // Fetch protocol items
    const { data: protocolItems, error: protocolError } = await supabase
      .from('protocol_items')
      .select('*')
      .eq('user_id', userId);

    if (protocolError) {
      console.error('Error fetching protocol items:', protocolError);
    }

    // Calculate check-in streak
    const calculateStreak = (checkIns: any[]) => {
      if (!checkIns || checkIns.length === 0) return 0;
      
      let streak = 0;
      const sortedCheckIns = [...checkIns].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedCheckIns.length; i++) {
        const checkInDate = new Date(sortedCheckIns[i].created_at);
        checkInDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);
        
        if (checkInDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };

    // Calculate insights
    const recentCheckIns = checkIns || [];
    const avgMood = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / recentCheckIns.length
      : 0;
    const avgEnergy = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + (c.energy || 0), 0) / recentCheckIns.length
      : 0;
    const avgStress = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + (c.stress || 0), 0) / recentCheckIns.length
      : 0;
    const avgSleep = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / recentCheckIns.length
      : 0;

    // Calculate trends (comparing first half vs second half of period)
    const midPoint = Math.floor(recentCheckIns.length / 2);
    const firstHalf = recentCheckIns.slice(0, midPoint);
    const secondHalf = recentCheckIns.slice(midPoint);

    const firstHalfMood = firstHalf.length > 0
      ? firstHalf.reduce((sum, c) => sum + (c.mood || 0), 0) / firstHalf.length
      : 0;
    const secondHalfMood = secondHalf.length > 0
      ? secondHalf.reduce((sum, c) => sum + (c.mood || 0), 0) / secondHalf.length
      : 0;

    const firstHalfEnergy = firstHalf.length > 0
      ? firstHalf.reduce((sum, c) => sum + (c.energy || 0), 0) / firstHalf.length
      : 0;
    const secondHalfEnergy = secondHalf.length > 0
      ? secondHalf.reduce((sum, c) => sum + (c.energy || 0), 0) / secondHalf.length
      : 0;

    const getMoodTrend = () => {
      if (Math.abs(secondHalfMood - firstHalfMood) < 0.5) return 'stable';
      return secondHalfMood > firstHalfMood ? 'up' : 'down';
    };

    const getEnergyTrend = () => {
      if (Math.abs(secondHalfEnergy - firstHalfEnergy) < 0.5) return 'stable';
      return secondHalfEnergy > firstHalfEnergy ? 'up' : 'down';
    };

    // Calculate journal stats
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const entriesThisWeek = (journalEntries || []).filter(
      entry => new Date(entry.created_at) >= oneWeekAgo
    ).length;

    // Calculate protocol completion
    const completedItems = (protocolItems || []).filter(item => item.completed).length;
    const totalItems = (protocolItems || []).length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Format response
    const dashboardData = {
      checkIns: {
        streak: calculateStreak(recentCheckIns),
        totalCheckins: recentCheckIns.length,
        recentCheckins: recentCheckIns.map(c => ({
          date: c.created_at,
          mood: c.mood || 0,
          energy: c.energy || 0,
          stress: c.stress || 0,
          sleep: c.sleep || 0,
        })),
      },
      journal: {
        totalEntries: (journalEntries || []).length,
        entriesThisWeek: entriesThisWeek,
      },
      protocol: {
        totalItems: totalItems,
        completedItems: completedItems,
        completionRate: completionRate,
      },
      insights: {
        moodTrend: getMoodTrend(),
        energyTrend: getEnergyTrend(),
        avgMood: parseFloat(avgMood.toFixed(1)),
        avgEnergy: parseFloat(avgEnergy.toFixed(1)),
        avgStress: parseFloat(avgStress.toFixed(1)),
        avgSleep: parseFloat(avgSleep.toFixed(1)),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
