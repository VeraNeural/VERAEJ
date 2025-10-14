import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Starting schema fix...');
    
    // Add all missing columns
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS orientation_completed BOOLEAN DEFAULT FALSE`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS orientation_data JSONB`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS test_mode BOOLEAN DEFAULT FALSE`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)`);
    
    // Make name column optional
    await query(`ALTER TABLE users ALTER COLUMN name DROP NOT NULL`);
    
    // Copy password_hash to password if needed
    await query(`UPDATE users SET password = password_hash WHERE password IS NULL OR password = ''`);
    
    // Set default values for orientation_completed if NULL
    await query(`UPDATE users SET orientation_completed = FALSE WHERE orientation_completed IS NULL`);
    
    // Verify the fix
    const afterCheck = await query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_name = 'users'
       ORDER BY ordinal_position`
    );
    
    return NextResponse.json({
      success: true,
      message: 'All columns fixed! Name is now optional.',
      columns: afterCheck.rows
    });
    
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
