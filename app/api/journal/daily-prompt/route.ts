import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get today's date to determine which prompt to show
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    // Get all prompts
    const prompts = await query('SELECT * FROM journal_prompts ORDER BY created_at');
    
    if (!prompts.rows || prompts.rows.length === 0) {
      return NextResponse.json(
        { error: 'No prompts available' },
        { status: 404 }
      );
    }

    // Rotate through prompts based on day of year
    const promptIndex = dayOfYear % prompts.rows.length;
    const todayPrompt = prompts.rows[promptIndex];

    return NextResponse.json({
      prompt: todayPrompt,
      dayIndex: dayOfYear
    });

  } catch (error) {
    console.error('Error fetching daily prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily prompt' },
      { status: 500 }
    );
  }
}
