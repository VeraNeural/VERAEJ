import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🔧 Setting up journal system...');

    // Create journal_prompts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_text TEXT NOT NULL,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create user_journal_responses table to track daily responses
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_journal_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        prompt_id UUID REFERENCES journal_prompts(id),
        response_date DATE NOT NULL,
        session_id UUID REFERENCES chat_sessions(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, response_date)
      );
    `);

    // Check if prompts already exist
    const existingPrompts = await pool.query('SELECT COUNT(*) as count FROM journal_prompts');
    
    if (parseInt(existingPrompts.rows[0].count) === 0) {
      // Insert initial somatic prompts
      await pool.query(`
        INSERT INTO journal_prompts (prompt_text, category) VALUES
        ('Take a moment to scan your body. What sensations are calling for your attention right now?', 'body_scan'),
        ('Where do you notice tension or tightness in your body today?', 'tension'),
        ('What does your nervous system need in this moment?', 'needs'),
        ('If your body could speak, what would it want you to know right now?', 'listening'),
        ('Notice your breath. What does its rhythm tell you about your state?', 'breath'),
        ('What emotions are you feeling in your body, not just your mind?', 'emotions'),
        ('Where do you feel most grounded in your body right now?', 'grounding'),
        ('What sensations arise when you think about the day ahead?', 'anticipation'),
        ('How does your heart space feel in this moment?', 'heart'),
        ('What would help you feel more present in your body right now?', 'presence'),
        ('Notice the quality of energy in your body. Is it restless, calm, heavy, or vibrant?', 'energy'),
        ('What physical sensations are connected to your current emotional state?', 'connection'),
        ('Where are you holding stress in your body today?', 'stress'),
        ('What does safety feel like in your body right now?', 'safety'),
        ('How is your nervous system responding to this moment?', 'nervous_system')
      `);
      console.log('✅ Inserted 15 journal prompts');
    } else {
      console.log('✅ Journal prompts already exist');
    }

    await pool.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Journal system set up successfully' 
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
