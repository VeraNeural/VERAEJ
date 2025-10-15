import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    console.log('🔧 Setting up journal entries table...');
    
    // First, check if journal_prompts table exists and has data
    try {
      const promptCheck = await pool.query('SELECT COUNT(*) FROM journal_prompts');
      console.log(`✅ Found ${promptCheck.rows[0].count} journal prompts`);
    } catch (e) {
      console.log('⚠️ journal_prompts table might not exist yet');
    }
    
    // Create journal_entries table (without strict foreign key)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        prompt_id UUID,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user 
      ON journal_entries(user_id, created_at DESC);
    `);
    
    // Create index for prompt lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_prompt 
      ON journal_entries(prompt_id);
    `);
    
    console.log('✅ Journal entries table created successfully');
    
    await pool.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Journal entries table created successfully'
    });
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      { 
        error: 'Setup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
