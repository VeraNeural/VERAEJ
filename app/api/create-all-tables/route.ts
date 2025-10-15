import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Fixing journal_entries table schema...');
    
    // Drop and recreate with correct UUID type
    await query(`DROP TABLE IF EXISTS journal_entries CASCADE`);
    console.log('✅ Dropped old journal_entries table');
    
    // Create with correct UUID types
    await query(`
      CREATE TABLE journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        prompt_id UUID,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ journal_entries table created with UUID types');
    
    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user 
      ON journal_entries(user_id, created_at DESC)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_prompt 
      ON journal_entries(prompt_id)
    `);
    console.log('✅ Indexes created');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Journal entries table fixed! user_id is now UUID.' 
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Replace the entire create-all-tables file with this**, push to GitHub, then visit:
```
https://www.veraneural.com/api/create-all-tables
