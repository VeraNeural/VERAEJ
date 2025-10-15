import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch user's journal entries
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    console.log('🔍 Fetching entries for user:', userId);
    
    const entries = await query(
      `SELECT je.*, jp.prompt_text, jp.category 
       FROM journal_entries je
       LEFT JOIN journal_prompts jp ON je.prompt_id = jp.id
       WHERE je.user_id = $1
       ORDER BY je.created_at DESC
       LIMIT 50`,
      [userId]
    );
    
    console.log('✅ Found entries:', entries.rows.length);
    
    return NextResponse.json({ entries: entries.rows });
    
  } catch (error) {
    console.error('❌ Error fetching journal entries:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch entries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Save a new journal entry
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();
    const { promptId, response, timestamp } = body;
    
    console.log('💾 Saving journal entry for user:', userId);
    console.log('Prompt ID:', promptId);
    console.log('Response length:', response?.length);
    
    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: 'Response cannot be empty' },
        { status: 400 }
      );
    }
    
    // Insert journal entry
    const result = await query(
      `INSERT INTO journal_entries (user_id, prompt_id, response, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, promptId, response.trim(), timestamp || new Date().toISOString()]
    );
    
    console.log('✅ Entry saved successfully:', result.rows[0].id);
    
    return NextResponse.json({
      success: true,
      entry: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error saving journal entry:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Failed to save entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
