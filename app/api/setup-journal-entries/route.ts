import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔧 Setting up journal entries table...');

    // Create journal_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        prompt_id UUID REFERENCES journal_prompts(id),
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user 
      ON journal_entries(user_id, created_at DESC);
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
