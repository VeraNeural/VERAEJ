import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔧 Setting up check-in table...');

    // Create daily_checkins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
        energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 10),
        stress INTEGER NOT NULL CHECK (stress >= 1 AND stress <= 10),
        sleep INTEGER NOT NULL CHECK (sleep >= 0 AND sleep <= 12),
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date 
      ON daily_checkins(user_id, created_at DESC);
    `);

    console.log('✅ Check-in table created successfully');

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Check-in table created successfully' 
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
