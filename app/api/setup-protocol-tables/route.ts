import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Creating protocol tables...');
    
    // Create protocols table
    await query(`
      CREATE TABLE IF NOT EXISTS protocols (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        frequency VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ protocols table created');
    
    // Create protocol_completions table
    await query(`
      CREATE TABLE IF NOT EXISTS protocol_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW(),
        notes TEXT
      )
    `);
    console.log('✅ protocol_completions table created');
    
    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_protocols_user 
      ON protocols(user_id, created_at DESC)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_protocol_completions_user 
      ON protocol_completions(user_id, completed_at DESC)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_protocol_completions_protocol 
      ON protocol_completions(protocol_id, completed_at DESC)
    `);
    console.log('✅ Indexes created');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Protocol tables created successfully!' 
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
