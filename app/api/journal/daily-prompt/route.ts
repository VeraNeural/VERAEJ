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
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Check if we should run the migration
  const shouldMigrate = req.nextUrl.searchParams.get('migrate') === 'true';
  
  if (shouldMigrate) {
    try {
      console.log('🔧 Fixing journal_entries table...');
      
      await query(`DROP TABLE IF EXISTS journal_entries CASCADE`);
      await query(`
        CREATE TABLE journal_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          prompt_id UUID,
          response TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await query(`CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id, created_at DESC)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_journal_entries_prompt ON journal_entries(prompt_id)`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Table fixed! user_id is now UUID type.' 
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // Normal daily prompt logic
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    const prompts = await query('SELECT * FROM journal_prompts ORDER BY created_at');
    
    if (!prompts.rows || prompts.rows.length === 0) {
      return NextResponse.json({ error: 'No prompts available' }, { status: 404 });
    }

    const promptIndex = dayOfYear % prompts.rows.length;
    const todayPrompt = prompts.rows[promptIndex];

    return NextResponse.json({
      prompt: todayPrompt,
      dayIndex: dayOfYear
    });

  } catch (error) {
    console.error('Error fetching daily prompt:', error);
    return NextResponse.json({ error: 'Failed to fetch daily prompt' }, { status: 500 });
  }
}
