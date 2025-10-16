import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch user's protocol items
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    console.log('🔍 Fetching protocol items for user:', userId);
    
    // Get all active protocol items for this user
    const result = await query(
      `SELECT * FROM protocol_items
       WHERE user_id = $1 AND is_active = true
       ORDER BY category, created_at ASC`,
      [userId]
    );
    
    console.log('✅ Found protocol items:', result.rows.length);
    
    return NextResponse.json(result.rows);
    
  } catch (error) {
    console.error('❌ Error fetching protocol items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol items' },
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
    
    console.log('💾 Creating protocol item for user:', userId);
    
    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO protocol_items (user_id, title, description, category, frequency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, description || '', category, frequency || 'daily']
    );
    
    console.log('✅ Protocol item created:', result.rows[0].id);
    
    return NextResponse.json({
      success: true,
      protocol: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error creating protocol item:', error);
    return NextResponse.json(
      { error: 'Failed to create protocol item' },
      { status: 500 }
    );
  }
}
