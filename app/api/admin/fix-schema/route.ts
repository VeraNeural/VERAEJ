import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Step 1: Check current schema
    const columnsCheck = await query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'users'
       ORDER BY ordinal_position`
    );
    
    console.log('Current columns:', columnsCheck.rows);
    
    // Step 2: Add password column if it doesn't exist
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`);
    
    // Step 3: Copy data from password_hash to password if password_hash exists
    const hasPasswordHash = columnsCheck.rows.some(row => row.column_name === 'password_hash');
    
    if (hasPasswordHash) {
      await query(`UPDATE users SET password = password_hash WHERE password IS NULL OR password = ''`);
    }
    
    // Step 4: Verify the fix
    const afterCheck = await query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'users'
       ORDER BY ordinal_position`
    );
    
    return NextResponse.json({
      success: true,
      message: 'Database schema fixed!',
      before: columnsCheck.rows,
      after: afterCheck.rows
    });
    
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
