import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔍 Checking database structure...');

    // Check if chat_sessions table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_sessions'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      await pool.end();
      return NextResponse.json({
        status: 'error',
        message: 'chat_sessions table does not exist',
        needsSetup: true
      });
    }

    // Get all columns in chat_sessions table
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'chat_sessions'
      ORDER BY ordinal_position;
    `);

    // Count sessions
    const countResult = await pool.query(`
      SELECT COUNT(*) as count FROM chat_sessions
    `);

    await pool.end();

    return NextResponse.json({
      status: 'success',
      tableExists: true,
      columns: columnsResult.rows,
      sessionCount: parseInt(countResult.rows[0].count),
      message: 'Database structure retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Database check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Database check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
