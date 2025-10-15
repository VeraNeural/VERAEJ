import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get 4 sample prompts - one from each category
    const prompts = await query(`
      SELECT DISTINCT ON (category) 
        id, prompt_text, category
      FROM journal_prompts
      ORDER BY category, RANDOM()
      LIMIT 4
    `);

    // Map database categories to UI categories
    const categoryMap: Record<string, string> = {
      'body_scan': 'physical',
      'tension': 'physical',
      'breath': 'physical',
      'energy': 'physical',
      'listening': 'emotional',
      'emotions': 'emotional',
      'heart': 'emotional',
      'needs': 'mental',
      'nervous_system': 'mental',
      'stress': 'mental',
      'safety': 'spiritual',
      'presence': 'spiritual',
      'grounding': 'spiritual',
      'connection': 'spiritual'
    };

    const formattedPrompts = prompts.rows.map(p => ({
      id: p.id,
      category: categoryMap[p.category] || 'mental',
      prompt: p.prompt_text
    }));

    return NextResponse.json(formattedPrompts);
    
  } catch (error) {
    console.error('Error fetching journal prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
