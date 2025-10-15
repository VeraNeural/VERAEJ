import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Creating all missing tables...');
    
    // Create journal_entries table
    await query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        prompt_id UUID,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ journal_entries table created');
    
    // Create indexes for journal_entries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user 
      ON journal_entries(user_id, created_at DESC)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_prompt 
      ON journal_entries(prompt_id)
    `);
    console.log('✅ journal_entries indexes created');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tables created successfully!' 
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
