import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Mark a protocol item as complete
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();
    const { protocolId } = body;
    
    console.log('✅ Completing protocol item:', protocolId, 'for user:', userId);
    
    if (!protocolId) {
      return NextResponse.json(
        { error: 'Protocol ID is required' },
        { status: 400 }
      );
    }
    
    // Update the protocol item: increment count and set last_completed
    const result = await query(
      `UPDATE protocol_items 
       SET completion_count = completion_count + 1,
           last_completed = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [protocolId, userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Protocol item not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Protocol item completed. New count:', result.rows[0].completion_count);
    
    return NextResponse.json({
      success: true,
      protocol: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error completing protocol item:', error);
    return NextResponse.json(
      { error: 'Failed to complete protocol item' },
      { status: 500 }
    );
  }
}
