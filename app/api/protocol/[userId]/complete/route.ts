import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Mark a protocol item as completed
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();
    const { protocolId, notes } = body;
    
    console.log('✅ Completing protocol:', protocolId);
    
    const result = await query(
      `INSERT INTO protocol_completions (protocol_id, user_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [protocolId, userId, notes || null]
    );
    
    return NextResponse.json({
      success: true,
      completion: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error completing protocol:', error);
    return NextResponse.json(
      { error: 'Failed to complete protocol' },
      { status: 500 }
    );
  }
}
