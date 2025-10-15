import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔧 Starting database migration...');

    // Check if messages column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chat_sessions' 
      AND column_name = 'messages'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Messages column already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'Messages column already exists' 
      });
    }

    // Add messages column
    console.log('➕ Adding messages column...');
    await pool.query(`
      ALTER TABLE chat_sessions 
      ADD COLUMN messages JSONB
    `);

    console.log('✅ Migration completed successfully');

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Messages column added successfully' 
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
