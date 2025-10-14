import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if password column exists
    const checkColumn = await query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name = 'password'`
    );
    
    if (checkColumn.rows.length === 0) {
      // Add password column
      await query(`ALTER TABLE users ADD COLUMN password VARCHAR(255)`);
      
      // Copy from password_hash if it exists
      const checkPasswordHash = await query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'users' AND column_name = 'password_hash'`
      );
      
      if (checkPasswordHash.rows.length > 0) {
        await query(`UPDATE users SET password = password_hash WHERE password IS NULL`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password column added and data copied' 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Password column already exists' 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 });
  }
}
