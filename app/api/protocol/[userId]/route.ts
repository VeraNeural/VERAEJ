import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch user's protocols (latest or all active)
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const url = new URL(req.url);
    const latestOnly = url.searchParams.get('latest') === 'true';
    
    console.log('🔍 Fetching protocols for user:', userId);
    
    if (latestOnly) {
      // Get only the most recent protocol (for backward compatibility)
      const result = await query(
        `SELECT p.*, 
                COUNT(pc.id) as completion_count,
                MAX(pc.completed_at) as last_completed
         FROM protocols p
         LEFT JOIN protocol_completions pc ON p.id = pc.protocol_id
         WHERE p.user_id = $1 AND p.is_active = true
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT 1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ protocol: null });
      }
      
      return NextResponse.json(result.rows[0]);
    }
    
    // Get all active protocols
    const protocols = await query(
      `SELECT p.*, 
              COUNT(pc.id) as completion_count,
              MAX(pc.completed_at) as last_completed
       FROM protocols p
       LEFT JOIN protocol_completions pc ON p.id = pc.protocol_id
       WHERE p.user_id = $1 AND p.is_active = true
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    console.log('✅ Found protocols:', protocols.rows.length);
    
    return NextResponse.json({ protocols: protocols.rows });
    
  } catch (error) {
    console.error('❌ Error fetching protocols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocols' },
      { status: 500 }
    );
  }
}

// POST - Create a new protocol item
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();
    const { title, description, category, frequency } = body;
    
    console.log('💾 Creating protocol for user:', userId);
    
    const result = await query(
      `INSERT INTO protocols (user_id, title, description, category, frequency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, description, category, frequency]
    );
    
    console.log('✅ Protocol created:', result.rows[0].id);
    
    return NextResponse.json({
      success: true,
      protocol: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error creating protocol:', error);
    return NextResponse.json(
      { error: 'Failed to create protocol' },
      { status: 500 }
    );
  }
}
